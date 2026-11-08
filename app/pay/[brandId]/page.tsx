import { redirect } from 'next/navigation'

export default async function PayBrandRedirect({
  params,
}: {
  params: Promise<{ brandId: string }>
}) {
  const { brandId } = await params
  redirect(`/pay?brand=${brandId}`)
}
