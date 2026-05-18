import { redirect } from 'next/navigation'
import { getNavGroups } from '@/lib/groups'

export default function Home() {
  const [first] = getNavGroups()
  redirect(`/${first.slug}/${first.topics[0]}`)
}
