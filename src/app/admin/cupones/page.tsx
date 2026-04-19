import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUserRole, isAdminUser } from '@/lib/user-role';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag } from 'lucide-react';
import DeepLuxLogo from '@/components/deeplux-logo';
import { CouponsTable } from './coupons-table';
import { CreateCouponDialog } from './create-coupon-dialog';

type CouponRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  percent_off: number | null;
  amount_off_cents: number | null;
  duration: 'once' | 'repeating' | 'forever';
  duration_in_months: number | null;
  times_redeemed: number;
  max_redemptions: number | null;
  redeem_by: string | null;
  is_active: boolean;
  first_time_only: boolean;
  applies_to_plan_types: string[];
  allowed_billing_intervals: string[];
  created_at: string;
  stripe_promotion_code_id: string | null;
};

type PlanRow = { id: string; slug: string; name: string; plan_type: string };

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/admin/cupones');

  const role = await getUserRole(supabase, user.id, user);
  if (!isAdminUser(role, user.email)) {
    redirect('/dashboard');
  }

  const [{ data: couponsRaw }, { data: plansRaw }] = await Promise.all([
    supabase.from('coupons').select('*').order('created_at', { ascending: false }),
    supabase
      .from('subscription_plans')
      .select('id, slug, name, plan_type')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  const coupons = (couponsRaw ?? []) as CouponRow[];
  const plans = (plansRaw ?? []) as PlanRow[];

  const activeCount = coupons.filter((c) => c.is_active).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.times_redeemed, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <DeepLuxLogo size="sm" />
            <div>
              <span className="font-headline text-lg font-bold">Cupones</span>
              <Badge variant="outline" className="ml-2 text-xs">Super Admin</Badge>
            </div>
          </div>
          <CreateCouponDialog plans={plans} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2 text-accent">
                <Tag className="h-4 w-4" />
                <span className="text-xs text-muted-foreground">Cupones activos</span>
              </div>
              <p className="font-bold text-2xl text-foreground">{activeCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2 text-blue-400">
                <Tag className="h-4 w-4" />
                <span className="text-xs text-muted-foreground">Total redenciones</span>
              </div>
              <p className="font-bold text-2xl text-foreground">{totalRedemptions}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span className="text-xs text-muted-foreground">Cupones totales</span>
              </div>
              <p className="font-bold text-2xl text-foreground">{coupons.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="font-headline text-base">Catálogo de cupones</CardTitle>
          </CardHeader>
          <CardContent>
            <CouponsTable coupons={coupons} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
