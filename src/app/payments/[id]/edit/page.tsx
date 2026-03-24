import PaymentForm from '@/components/PaymentForm';
import { getPayment, getClients } from '@/lib/actions';
import { notFound } from 'next/navigation';

export default async function EditPaymentPage({ params }: { params: { id: string } }) {
  const [payment, clients] = await Promise.all([
    getPayment(parseInt(params.id)),
    getClients(),
  ]);

  if (!payment) {
    notFound();
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar Pago</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
        <PaymentForm payment={payment} clients={clients} isEditing />
      </div>
    </div>
  
  </div>
  );
}
