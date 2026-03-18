from .charge_service import explain_charges, unpaid_charges_summary
import logging

logger = logging.getLogger(__name__)

def handle_dynamic_intent(intent, user_id):
    """Route intents to appropriate handlers"""
    
    logger.info(f"Handling intent: {intent} for user: {user_id}")
    
    intent_handlers = {
        "resident.charges.list": lambda: explain_charges(user_id),
        "resident.charges.by_status": lambda: unpaid_charges_summary(user_id),
        "ViewCharges": lambda: explain_charges(user_id),
    }
    
    handler = intent_handlers.get(intent)
    
    if handler:
        try:
            result = handler()
            return result
        except Exception as e:
            logger.error(f"Handler error: {str(e)}", exc_info=True)
            return f"Sorry, I encountered an error retrieving your charges."
    else:
        return f"I understood your intent ({intent}), but I don't have a handler for it yet."