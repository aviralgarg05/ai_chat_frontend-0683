import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Check, Sparkles, MessageSquare } from 'lucide-react';
import type { FilterState } from '@/types/filters';
import { occasions, personas, ageRanges, genders, interests, priceRanges, buildMessage } from '@/types/filters';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface GuidedFiltersProps {
  onComplete: (message: string) => void;
}

export function GuidedFilters({ onComplete }: GuidedFiltersProps) {
  const [mode, setMode] = useState<'guided' | 'direct'>('guided');
  const [step, setStep] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    mode: 'guided',
    interests: [],
    gender: 'Prefer not to say'
  });

  const totalSteps = 8;

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const message = buildMessage({ ...filters, mode });
      onComplete(message);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    if (mode === 'direct') {
      return filters.directPrompt && filters.directPrompt.trim().length > 0;
    }

    switch (step) {
      case 1: return !!filters.occasion;
      case 2: return !!filters.persona;
      case 3: return !!filters.age;
      case 4: return true;
      case 5: return true;
      case 6: return !!filters.priceRange;
      case 7: return true;
      case 8: return true;
      default: return false;
    }
  };

  const stepTitles = [
    'Occasion',
    'For Whom',
    'Age',
    'Gender',
    'Interests',
    'Budget',
    'Extra Details',
    'Review'
  ];

  if (mode === 'direct') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex justify-center">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'guided' | 'direct')} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="guided" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Guided
              </TabsTrigger>
              <TabsTrigger value="direct" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Direct
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card className="p-6 md:p-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="direct-prompt" className="text-base font-semibold">
              What are you looking for?
            </Label>
            <Textarea
              id="direct-prompt"
              placeholder='e.g., "I need gift ideas for Diwali — for my 28-year-old girlfriend who loves music & beauty, budget ₹3000"'
              value={filters.directPrompt || ''}
              onChange={(e) => {
                const value = e.target.value.slice(0, 300);
                updateFilter('directPrompt', value);
              }}
              className="min-h-[120px] resize-none"
              maxLength={300}
            />
            <p className="text-sm text-muted-foreground text-right">
              {filters.directPrompt?.length || 0}/300
            </p>
          </div>

          <Button
            onClick={() => onComplete(filters.directPrompt?.replace(/\s+/g, ' ').trim() || '')}
            disabled={!canProceed()}
            className="w-full h-11"
            size="lg"
          >
            Start Shopping
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-center">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'guided' | 'direct')} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guided" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Guided
            </TabsTrigger>
            <TabsTrigger value="direct" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Direct
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="hidden md:flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === step;
          const isCompleted = stepNum < step;

          return (
            <div key={stepNum} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : stepNum}
              </div>
              {stepNum < totalSteps && (
                <div
                  className={`w-8 h-0.5 ${
                    isCompleted ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="md:hidden flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold">
            {step}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
            <p className="font-semibold">{stepTitles[step - 1]}</p>
          </div>
        </div>
        <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-6 md:p-8">
        <StepContent
          step={step}
          filters={filters}
          updateFilter={updateFilter}
        />
      </Card>

      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="h-11"
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="h-11 px-8"
        >
          {step === totalSteps ? 'Start Shopping' : 'Next'}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

interface StepContentProps {
  step: number;
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
}

function StepContent({ step, filters, updateFilter }: StepContentProps) {
  const SelectionChip = ({ 
    label, 
    selected, 
    onClick 
  }: { 
    label: string; 
    selected: boolean; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full border-2 transition-all text-sm md:text-base ${
        selected
          ? 'border-primary bg-primary text-primary-foreground shadow-md'
          : 'border-border hover:border-primary/50 hover:bg-accent'
      }`}
    >
      {label}
    </button>
  );

  switch (step) {
    case 1:
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">What's the occasion?</h2>
            <p className="text-muted-foreground text-sm md:text-base">Select one</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {occasions.map((occasion) => (
              <SelectionChip
                key={occasion}
                label={occasion}
                selected={filters.occasion === occasion}
                onClick={() => updateFilter('occasion', occasion)}
              />
            ))}
          </div>
        </div>
      );

    case 2:
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Who is this for?</h2>
            <p className="text-muted-foreground text-sm md:text-base">Select one</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {personas.map((persona) => (
              <SelectionChip
                key={persona}
                label={persona}
                selected={filters.persona === persona}
                onClick={() => updateFilter('persona', persona)}
              />
            ))}
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">What's their age?</h2>
            <p className="text-muted-foreground text-sm md:text-base">Select one</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {ageRanges.map((age) => (
              <SelectionChip
                key={age}
                label={age}
                selected={filters.age === age}
                onClick={() => updateFilter('age', age)}
              />
            ))}
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Gender</h2>
            <p className="text-muted-foreground text-sm md:text-base">Optional - select one</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {genders.map((gender) => (
              <SelectionChip
                key={gender}
                label={gender}
                selected={filters.gender === gender}
                onClick={() => updateFilter('gender', gender)}
              />
            ))}
          </div>
        </div>
      );

    case 5:
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">What are they interested in?</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Optional - select up to 4 {filters.interests.length > 0 && `(${filters.interests.length}/4 selected)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {interests.map((interest) => {
              const isSelected = filters.interests.includes(interest);
              const canSelect = filters.interests.length < 4 || isSelected;

              return (
                <button
                  key={interest}
                  onClick={() => {
                    if (isSelected) {
                      updateFilter('interests', filters.interests.filter(i => i !== interest));
                    } else if (canSelect) {
                      updateFilter('interests', [...filters.interests, interest]);
                    }
                  }}
                  disabled={!canSelect}
                  className={`px-4 py-2.5 rounded-full border-2 transition-all text-sm md:text-base ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground shadow-md'
                      : canSelect
                      ? 'border-border hover:border-primary/50 hover:bg-accent'
                      : 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>
      );

    case 6:
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">What's your budget?</h2>
            <p className="text-muted-foreground text-sm md:text-base">Select a price range (₹)</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {priceRanges.map((range) => (
              <SelectionChip
                key={range}
                label={`₹${range}`}
                selected={filters.priceRange === range}
                onClick={() => updateFilter('priceRange', range)}
              />
            ))}
          </div>
        </div>
      );

    case 7:
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Any extra details?</h2>
            <p className="text-muted-foreground text-sm md:text-base">Optional - add specific preferences</p>
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="e.g., likes photography, prefers eco-friendly products..."
              value={filters.extraDetails || ''}
              onChange={(e) => {
                const value = e.target.value.slice(0, 140);
                updateFilter('extraDetails', value);
              }}
              className="min-h-[100px] resize-none"
              maxLength={140}
            />
            <p className="text-sm text-muted-foreground text-right">
              {filters.extraDetails?.length || 0}/140
            </p>
          </div>
        </div>
      );

    case 8:
      const message = buildMessage(filters);
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Review your request</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Here's what we'll search for
            </p>
          </div>

          <div className="space-y-4">
            <ReviewItem label="Occasion" value={filters.occasion} />
            <ReviewItem label="For Whom" value={filters.persona} />
            <ReviewItem label="Age" value={filters.age} />
            <ReviewItem label="Gender" value={filters.gender} />
            <ReviewItem 
              label="Interests" 
              value={filters.interests.length > 0 ? filters.interests.join(', ') : undefined} 
            />
            <ReviewItem label="Budget" value={filters.priceRange ? `₹${filters.priceRange}` : undefined} />
            <ReviewItem label="Extra Details" value={filters.extraDetails} />
          </div>

          <div className="p-4 md:p-6 bg-accent rounded-lg border-2 border-border">
            <p className="text-sm text-muted-foreground mb-2 font-semibold">Generated Message:</p>
            <p className="text-sm md:text-base">{message}</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}

function ReviewItem({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground min-w-[120px] font-medium">{label}</span>
      <span className="text-sm md:text-base">{value}</span>
    </div>
  );
}
