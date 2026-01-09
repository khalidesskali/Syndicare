from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from ..serializers import UserSerializer
from ..permissions import IsAdmin, IsSyndic, IsResident
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from ..models import User, Subscription, Payment, Immeuble, Appartement, Reclamation, Reunion, Charge, ResidentProfile, ResidentPayment
from ..serializers import ChargeSerializer

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
    last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
    
    # ====================
    # OVERVIEW STATISTICS
    # ====================
    
    # 1. Total Syndics
    total_syndics = User.objects.filter(role='SYNDIC').count()
    
    # Syndics added this month
    syndics_this_month = User.objects.filter(
        role='SYNDIC',
        created_at__gte=current_month_start
    ).count()
    
    # 2. Active Subscriptions
    active_subscriptions = Subscription.objects.filter(
        status='ACTIVE',
        start_date__lte=today,
        end_date__gte=today
    ).count()
    
    # Conversion rate (percentage of syndics with active subscriptions)
    conversion_rate = round((active_subscriptions / total_syndics * 100), 1) if total_syndics > 0 else 0
    
    # 3. Monthly Revenue (include all payments: pending + completed)
    current_month_payments = Payment.objects.filter(
        payment_date__gte=current_month_start
    )
    monthly_revenue = current_month_payments.aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Last month revenue for comparison
    last_month_payments = Payment.objects.filter(
        payment_date__gte=last_month_start,
        payment_date__lt=current_month_start
    )
    last_month_revenue = last_month_payments.aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Revenue change
    revenue_change = monthly_revenue - last_month_revenue
    
    # 4. Pending Payments
    pending_payments_queryset = Payment.objects.filter(status='PENDING')
    pending_payments_count = pending_payments_queryset.count()
    pending_payments_total = pending_payments_queryset.aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # ====================
    # RECENT SYNDICS (Last 5)
    # ====================
    recent_syndics = User.objects.filter(role='SYNDIC').order_by('-created_at')[:5]
    recent_syndics_data = []
    
    for syndic in recent_syndics:
        # Get subscription status
        subscription_status = 'pending'
        try:
            if hasattr(syndic, 'syndic_profile') and hasattr(syndic.syndic_profile, 'subscription'):
                sub = syndic.syndic_profile.subscription
                if sub.status == 'ACTIVE' and sub.is_active:
                    subscription_status = 'active'
                elif sub.status == 'SUSPENDED':
                    subscription_status = 'suspended'
                elif sub.status == 'EXPIRED':
                    subscription_status = 'expired'
        except:
            pass
        
        # Calculate time ago
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
            'status': subscription_status,
            'time_ago': time_ago
        })
    
    # ====================
    # RECENT PAYMENTS (Last 5)
    # ====================
    recent_payments_queryset = Payment.objects.select_related(
        'subscription__syndic_profile__user',
        'subscription__plan'
    ).order_by('-payment_date')[:5]
    
    recent_payments_data = []
    for payment in recent_payments_queryset:
        try:
            plan_name = payment.subscription.plan.name
        except:
            plan_name = 'N/A'
        
        # Calculate time ago
        time_diff = timezone.now() - payment.payment_date
        if time_diff.days > 0:
            time_ago = f"{time_diff.days} day{'s' if time_diff.days > 1 else ''} ago"
        else:
            hours = time_diff.seconds // 3600
            minutes = (time_diff.seconds % 3600) // 60
            seconds = (time_diff.seconds % 60)
            if hours > 0:
                time_ago = f"{hours} hour{'s' if hours > 1 else ''} ago"
            elif minutes > 0:
                time_ago = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
            else:
                time_ago = f"{seconds} second{'s' if seconds > 1 else ''} ago"
        
        recent_payments_data.append({
            'id': payment.id,
            'plan': plan_name,
            'amount': float(payment.amount),
            'status': payment.status,
            'time_ago': time_ago
        })

    
    return Response({
        'success': True,
        'data': {
            'overview': {
                'total_syndics': total_syndics,
                'syndics_this_month': syndics_this_month,
                'active_subscriptions': active_subscriptions,
                'conversion_rate': conversion_rate,
                'monthly_revenue': float(monthly_revenue),
                'revenue_change': float(revenue_change),
                'pending_payments': pending_payments_count,
                'pending_payments_total': float(pending_payments_total)
            },
            'recent_syndics': recent_syndics_data,
            'recent_payments': recent_payments_data,
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
    current_month_start = timezone.make_aware(
        timezone.datetime.combine(today.replace(day=1), timezone.datetime.min.time())
    )
    last_month_start = timezone.make_aware(
        timezone.datetime.combine(
            (current_month_start.date() - timedelta(days=1)).replace(day=1),
            timezone.datetime.min.time()
        )
    )

    # ==================== 
    # BUILDINGS STATISTICS
    # ====================
    buildings = Immeuble.objects.filter(syndic=syndic)
    total_buildings = buildings.count()
    
    # Buildings added this month
    buildings_this_month = buildings.filter(
        created_at__gte=current_month_start
    ).count()

    # ==================== 
    # RESIDENTS STATISTICS
    # ====================
    apartments = Appartement.objects.filter(immeuble__syndic=syndic)
    total_residents = User.objects.filter(
        role='RESIDENT',
        appartements__in=apartments
    ).distinct().count()
    
    # Residents added this month
    residents_this_month = User.objects.filter(
        role='RESIDENT',
        appartements__in=apartments,
        created_at__gte=current_month_start
    ).distinct().count()

    # ==================== 
    # CHARGES STATISTICS
    # ====================
    charges_queryset = Charge.objects.filter(appartement__immeuble__syndic=syndic)
    
    pending_charges = charges_queryset.filter(
        status__in=['UNPAID', 'PARTIALLY_PAID']
    ).count()

    # Monthly revenue from paid charges (using paid_date instead of updated_at)
    current_month_charges = charges_queryset.filter(
        status='PAID',
        paid_date__gte=current_month_start
    )
    monthly_revenue = current_month_charges.aggregate(
        total=Sum('amount')
    )['total'] or 0

    # Last month revenue for comparison
    last_month_charges = charges_queryset.filter(
        status='PAID',
        paid_date__gte=last_month_start,
        paid_date__lt=current_month_start
    )
    last_month_revenue = last_month_charges.aggregate(
        total=Sum('amount')
    )['total'] or 0

    # Revenue change percentage
    revenue_change = 0
    if last_month_revenue > 0:
        revenue_change = round(
            ((monthly_revenue - last_month_revenue) / last_month_revenue * 100), 1
        )
    elif monthly_revenue > 0:
        revenue_change = 100

    # ==================== 
    # REUNIONS STATISTICS
    # ====================
    now = timezone.now()
    upcoming_reunions = Reunion.objects.filter(
        syndic=syndic,
        status='SCHEDULED',
        date_time__gt=now
    ).count()

    # ==================== 
    # RECLAMATIONS STATISTICS
    # ====================
    reclamations_queryset = Reclamation.objects.filter(
        appartement__immeuble__syndic=syndic
    )
    
    open_complaints = reclamations_queryset.filter(
        status__in=['PENDING', 'IN_PROGRESS']
    ).count()

    # Urgent complaints (created more than 7 days ago and still pending)
    urgent_cutoff = timezone.make_aware(
        timezone.datetime.combine(today - timedelta(days=7), timezone.datetime.min.time())
    )
    urgent_complaints = reclamations_queryset.filter(
        status__in=['PENDING', 'IN_PROGRESS'],
        created_at__lte=urgent_cutoff
    ).count()

    # ==================== 
    # FINANCIAL OVERVIEW
    # ====================
    total_monthly_charges = apartments.aggregate(
        total=Sum('monthly_charge')
    )['total'] or 0

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
            'has_valid_subscription': syndic.has_valid_subscription
        }
    })

@api_view(['GET'])
@permission_classes([IsResident])
def resident_dashboard(request):
    """
    Resident Dashboard Overview
    Supports residents owning multiple apartments
    """

    user = request.user
    today = timezone.now().date()

    # Get all apartments linked to the resident
    apartments = user.appartements.all()  # adjust related_name if different

    if not apartments.exists():
        return Response({
            'success': False,
            'message': 'Resident is not linked to any apartment'
        }, status=400)

    # Charges for all resident apartments
    charges_qs = Charge.objects.filter(appartement__in=apartments)

    # Total unpaid amount (UNPAID + PARTIALLY_PAID)
    total_unpaid = charges_qs.filter(
        status__in=['UNPAID', 'PARTIALLY_PAID']
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Overdue charges count
    overdue_count = charges_qs.filter(
        status='UNPAID',
        due_date__lt=today
    ).count()

    # Last payment across all apartments
    last_payment = ResidentPayment.objects.filter(
        resident=user,
        appartement__in=apartments
    ).select_related('charge').order_by('-created_at').first()

    last_payment_data = None
    if last_payment:
        last_payment_data = {
            'amount': float(last_payment.amount),
            'date': last_payment.created_at.date().isoformat(),
            'reference': last_payment.reference,
            'charge_description': last_payment.charge.description,
            'apartment_id': last_payment.appartement.id
        }

    # Recent charges (last 5 across all apartments)
    recent_charges = charges_qs.order_by('-created_at')[:5]
    recent_charges_data = ChargeSerializer(recent_charges, many=True).data

    return Response({
        'success': True,
        'data': {
            'apartments_count': apartments.count(),
            'total_unpaid': float(total_unpaid),
            'overdue_charges': overdue_count,
            'last_payment': last_payment_data,
            'recent_charges': recent_charges_data
        }
    })