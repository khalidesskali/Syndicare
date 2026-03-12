from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

from apps.users.serializers import UserSerializer
from apps.users.permissions import IsAdmin, IsSyndic, IsResident
from apps.buildings.models import Immeuble
from apps.apartments.models import Appartement
from apps.complaints.models import Reclamation
from apps.meetings.models import Reunion
from apps.payments.models import Charge, ChargePayment
from apps.apartments.serializers import AppartementSerializer
from apps.meetings.serializers import ReunionSerializer
from apps.complaints.serializers import ReclamationSerializer
from apps.payments.serializers import ChargeSerializer

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard(request):
    """
    Admin dashboard endpoint with complete statistics
    GET /api/admin/dashboard/
    """
    today = timezone.now().date()
    current_month_start = today.replace(day=1)
    
    # 1. Total Syndics
    total_syndics = User.objects.filter(role='SYNDIC').count()
    
    # Syndics added this month
    syndics_this_month = User.objects.filter(
        role='SYNDIC',
        created_at__gte=current_month_start
    ).count()
    
    # Recent Syndics (Last 5)
    recent_syndics = User.objects.filter(role='SYNDIC').order_by('-created_at')[:5]
    recent_syndics_data = []
    
    for syndic in recent_syndics:
        time_diff = timezone.now() - syndic.created_at
        if time_diff.days > 0:
            time_ago = f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
        else:
            hours = time_diff.seconds // 3600
            minutes = (time_diff.seconds % 3600) // 60
            if hours > 0:
                time_ago = f"{hours} hour{'s' if hours > 1 else ''} ago"
            else:
                time_ago = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        
        recent_syndics_data.append({
            'id': syndic.id,
            'name': f"{syndic.first_name} {syndic.last_name}".strip() or syndic.email,
            'time_ago': time_ago
        })
    
    return Response({
        'success': True,
        'data': {
            'overview': {
                'total_syndics': total_syndics,
                'syndics_this_month': syndics_this_month,
            },
            'recent_syndics': recent_syndics_data,
        }
    })


@api_view(['GET'])
@permission_classes([IsSyndic])
def syndic_dashboard(request):
    """
    Enhanced Syndic dashboard with comprehensive statistics
    GET /api/syndic/dashboard/
    """
    syndic = request.user
    today = timezone.now().date()
    # Ensure current_month_start is aware
    current_month_start = timezone.make_aware(
        timezone.datetime.combine(today.replace(day=1), timezone.datetime.min.time())
    )
    last_month_start = timezone.make_aware(
        timezone.datetime.combine(
            (current_month_start.date() - timedelta(days=1)).replace(day=1),
            timezone.datetime.min.time()
        )
    )

    # Buildings
    buildings = Immeuble.objects.filter(syndic=syndic)
    total_buildings = buildings.count()
    buildings_this_month = buildings.filter(created_at__gte=current_month_start).count()

    # Residents
    apartments = Appartement.objects.filter(immeuble__syndic=syndic)
    total_residents = User.objects.filter(
        role='RESIDENT',
        appartements__in=apartments
    ).distinct().count()
    
    residents_this_month = User.objects.filter(
        role='RESIDENT',
        appartements__in=apartments,
        created_at__gte=current_month_start
    ).distinct().count()

    # Charges
    charges_queryset = Charge.objects.filter(appartement__immeuble__syndic=syndic)
    pending_charges = charges_queryset.filter(status__in=['UNPAID', 'PARTIALLY_PAID']).count()

    current_month_charges = charges_queryset.filter(status='PAID', paid_date__gte=current_month_start)
    monthly_revenue = current_month_charges.aggregate(total=Sum('amount'))['total'] or 0

    last_month_charges = charges_queryset.filter(
        status='PAID',
        paid_date__gte=last_month_start,
        paid_date__lt=current_month_start
    )
    last_month_revenue = last_month_charges.aggregate(total=Sum('amount'))['total'] or 0

    revenue_change = 0
    if last_month_revenue > 0:
        revenue_change = round(((monthly_revenue - last_month_revenue) / last_month_revenue * 100), 1)
    elif monthly_revenue > 0:
        revenue_change = 100

    # Reunions
    now = timezone.now()
    upcoming_reunions = Reunion.objects.filter(
        syndic=syndic,
        status='SCHEDULED',
        date_time__gt=now
    ).count()

    # Reclamations
    reclamations_queryset = Reclamation.objects.filter(appartement__immeuble__syndic=syndic)
    open_complaints = reclamations_queryset.filter(status__in=['PENDING', 'IN_PROGRESS']).count()

    urgent_cutoff = timezone.make_aware(
        timezone.datetime.combine(today - timedelta(days=7), timezone.datetime.min.time())
    )
    urgent_complaints = reclamations_queryset.filter(
        status__in=['PENDING', 'IN_PROGRESS'],
        created_at__lte=urgent_cutoff
    ).count()

    total_monthly_charges = apartments.aggregate(total=Sum('monthly_charge'))['total'] or 0

    return Response({
        'success': True,
        'data': {
            'overview': {
                'total_buildings': total_buildings,
                'buildings_this_month': buildings_this_month,
                'total_residents': total_residents,
                'residents_this_month': residents_this_month,
                'pending_charges': pending_charges,
                'upcoming_reunions': upcoming_reunions,
                'open_complaints': open_complaints,
                'urgent_complaints': urgent_complaints,
            },
            'financial': {
                'monthly_revenue': float(monthly_revenue),
                'revenue_change': float(revenue_change),
                'total_monthly_charges': float(total_monthly_charges),
                'last_month_revenue': float(last_month_revenue),
            },
            'user': UserSerializer(syndic).data,
        }
    })

@api_view(['GET'])
@permission_classes([IsResident])
def resident_dashboard(request):
    """
    Enhanced Resident Dashboard Overview
    """
    user = request.user
    today = timezone.now().date()
    current_year = today.year

    apartments = user.appartements.all().select_related('immeuble')
    if not apartments.exists():
        return Response({
            'success': False,
            'message': 'Resident is not linked to any apartment'
        }, status=400)
    
    apartments_data = AppartementSerializer(apartments, many=True).data
    charges_qs = Charge.objects.filter(appartement__in=apartments)
    
    total_unpaid = charges_qs.filter(
        status__in=['UNPAID', 'PARTIALLY_PAID']
    ).aggregate(total=Sum('amount'))['total'] or 0

    overdue_count = charges_qs.filter(status='UNPAID', due_date__lt=today).count()

    charge_breakdown = {
        'total': charges_qs.count(),
        'paid': charges_qs.filter(status='PAID').count(),
        'unpaid': charges_qs.filter(status='UNPAID').count(),
        'overdue': overdue_count,
        'partially_paid': charges_qs.filter(status='PARTIALLY_PAID').count()
    }

    payments_qs = ChargePayment.objects.filter(resident=user)
    total_paid_all_time = payments_qs.filter(status='CONFIRMED').aggregate(total=Sum('amount'))['total'] or 0
    total_paid_this_year = payments_qs.filter(
        status='CONFIRMED', 
        paid_at__year=current_year
    ).aggregate(total=Sum('amount'))['total'] or 0

    last_payment = payments_qs.select_related('charge', 'appartement').order_by('-created_at').first()
    last_payment_data = None
    if last_payment:
        last_payment_data = {
            'id': last_payment.id,
            'amount': float(last_payment.amount),
            'date': last_payment.created_at.date().isoformat(),
            'reference': last_payment.reference,
            'charge_description': last_payment.charge.description if last_payment.charge else "N/A",
            'apartment_number': last_payment.appartement.number if last_payment.appartement else "N/A",
            'status': last_payment.status
        }

    buildings = [apt.immeuble for apt in apartments]
    upcoming_meetings = Reunion.objects.filter(
        immeuble__in=buildings,
        status='SCHEDULED',
        date_time__gte=timezone.now()
    ).order_by('date_time')[:2]
    meetings_data = ReunionSerializer(upcoming_meetings, many=True).data

    recent_reclamations = Reclamation.objects.filter(resident=user).order_by('-created_at')[:3]
    reclamations_data = ReclamationSerializer(recent_reclamations, many=True).data

    recent_charges = charges_qs.order_by('-created_at')[:5]
    recent_charges_data = ChargeSerializer(recent_charges, many=True).data

    return Response({
        'success': True,
        'data': {
            'user': {
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}",
                'email': user.email,
            },
            'apartments': apartments_data,
            'stats': {
                'total_unpaid': float(total_unpaid),
                'overdue_count': overdue_count,
                'total_paid_all_time': float(total_paid_all_time),
                'total_paid_this_year': float(total_paid_this_year),
                'charge_breakdown': charge_breakdown
            },
            'last_payment': last_payment_data,
            'upcoming_meetings': meetings_data,
            'recent_reclamations': reclamations_data,
            'recent_charges': recent_charges_data
        }
    })
