import PaymentForm from 'A/components/PaymentForm';
import { getClients } from '@/lib/actions';

export default async function NewPaymentPage() {
  const clients = await getClients();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Nuevo Pago</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
        <PaymentForm clients={clients} />
      </div>
    </div>
  );
}
