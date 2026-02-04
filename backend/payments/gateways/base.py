from abc import ABC, abstractmethod
from typing import Dict, Optional

class PaymentGateway(ABC):
    @abstractmethod
    def process_payment(self, amount: float, currency: str, **kwargs) -> Dict:
        pass
    
    @abstractmethod
    def get_payment_status(self, payment_id: str) -> Dict:
        pass
    
    @abstractmethod
    def refund_payment(self, payment_id: str, amount: Optional[float] = None) -> Dict:
        pass