import { Suspense } from 'react';
import CheckoutSuccess from '@/components/checkout/CheckoutSuccess';

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccess />
    </Suspense>
  );
} 