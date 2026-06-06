type StepValue = string | number

interface UseLinearStepperParams<T extends StepValue> {
  currentStep: T
  steps: readonly T[]
  isStepValid: (step: T) => boolean
  onStepChange: (step: T) => void
  onExit?: () => void
  onComplete?: () => void | Promise<void>
}

export function useLinearStepper<T extends StepValue>({
  currentStep,
  steps,
  isStepValid,
  onStepChange,
  onExit,
  onComplete,
}: UseLinearStepperParams<T>) {
  const currentIndex = steps.indexOf(currentStep)
  const isManagedStep = currentIndex >= 0
  const totalSteps = steps.length
  const progress = isManagedStep && totalSteps > 0 ? (currentIndex + 1) / totalSteps : 0
  const isCurrentStepValid = isManagedStep ? isStepValid(currentStep) : false

  const goBack = async () => {
    if (!isManagedStep || currentIndex === 0) {
      onExit?.()
      return
    }

    onStepChange(steps[currentIndex - 1])
  }

  const goNext = async () => {
    if (!isManagedStep || !isCurrentStepValid) {
      return
    }

    if (currentIndex === totalSteps - 1) {
      await onComplete?.()
      return
    }

    onStepChange(steps[currentIndex + 1])
  }

  return {
    currentIndex,
    totalSteps,
    progress,
    isManagedStep,
    isCurrentStepValid,
    goBack,
    goNext,
  }
}
