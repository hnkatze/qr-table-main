import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlanOptionCard } from './plan-option-card';
import type { Plan } from '@/types/plan';

interface PlanCatalogSectionProps {
  plans: Plan[];
  currentPlanId: string | null;
  isSwitching: boolean;
  onSelectPlan: (planId: string) => void;
}

/**
 * Section listing all available plans in a responsive grid.
 * Highlights the current plan and disables all selectors while a switch is
 * in progress. Pure presentational.
 */
export function PlanCatalogSection({
  plans,
  currentPlanId,
  isSwitching,
  onSelectPlan,
}: PlanCatalogSectionProps) {
  return (
    <Card className="relative overflow-hidden">
      {/* Left accent strip */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-brand-violet"
      />

      <CardHeader className="pl-6">
        <CardTitle className="text-base font-semibold text-foreground">
          Planes disponibles
        </CardTitle>
        <CardDescription>
          Cambiá de plan en cualquier momento. Los cambios se aplican de forma inmediata.
        </CardDescription>
      </CardHeader>

      <CardContent className="pl-6">
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Planes disponibles"
        >
          {plans.map((plan) => (
            <div key={plan.id} role="listitem">
              <PlanOptionCard
                plan={plan}
                isCurrent={plan.id === currentPlanId}
                isDisabled={isSwitching}
                onSelect={onSelectPlan}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
