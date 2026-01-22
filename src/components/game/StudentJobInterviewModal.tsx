import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { soundManager } from '@/lib/soundManager';

interface StudentJobInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPassed: () => void;
}

type Question = {
  intro: string;
  question: string;
  answers: { id: string; label: string; correct: boolean }[];
};

const StudentJobInterviewModal = ({ isOpen, onClose, onPassed }: StudentJobInterviewModalProps) => {
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<'idle' | 'passed' | 'failed'>('idle');

  const q = useMemo<Question>(() => {
    // Simple deterministic question bank (no extra deps)
    const bank: Question[] = [
      {
        intro: 'Der Chef der Zeitung schaut dich streng an.',
        question: '"Wenn du 8 Zeitungen pro Straße verteilst und es gibt 7 Straßen – wie viele Zeitungen sind das?"',
        answers: [
          { id: 'a', label: '56', correct: true },
          { id: 'b', label: '54', correct: false },
          { id: 'c', label: '63', correct: false },
        ],
      },
      {
        intro: 'Eine Kundin beschwert sich am Telefon.',
        question: '"Was sagst du zuerst?"',
        answers: [
          { id: 'a', label: 'Tut mir leid, ich kläre das sofort.', correct: true },
          { id: 'b', label: 'Nicht mein Problem!', correct: false },
          { id: 'c', label: 'Leg einfach auf.', correct: false },
        ],
      },
    ];
    return bank[Math.floor(Math.random() * bank.length)];
  }, [isOpen]);

  const reset = () => {
    setPicked(null);
    setResult('idle');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = () => {
    if (!picked) return;
    const ans = q.answers.find(a => a.id === picked);
    if (ans?.correct) {
      soundManager.playPositiveEffect();
      setResult('passed');
    } else {
      soundManager.playNegativeEffect();
      setResult('failed');
    }
  };

  const acceptJob = () => {
    onPassed();
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">Schülerjob: Zeitung</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">{q.intro}</p>
          <p className="text-foreground">{q.question}</p>

          <div className="grid gap-2">
            {q.answers.map(a => (
              <button
                key={a.id}
                type="button"
                onClick={() => setPicked(a.id)}
                className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
                  picked === a.id
                    ? 'border-primary bg-primary/10'
                    : 'border-primary/30 hover:bg-primary/5'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {result === 'idle' && (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleClose}>Abbrechen</Button>
              <Button onClick={submit} disabled={!picked} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Antworten
              </Button>
            </div>
          )}

          {result === 'failed' && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <p className="font-medium text-destructive">Nicht bestanden.</p>
              <p className="text-sm text-muted-foreground">"Nächstes Jahr vielleicht."</p>
              <div className="mt-3 flex justify-end">
                <Button variant="outline" onClick={handleClose}>Ok</Button>
              </div>
            </div>
          )}

          {result === 'passed' && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
              <p className="font-medium text-primary">Bestanden!</p>
              <p className="text-sm text-muted-foreground">"Du kannst sofort anfangen."</p>
              <div className="mt-3 flex justify-end">
                <Button onClick={acceptJob} className="bg-primary text-primary-foreground hover:bg-primary/90">Job annehmen</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentJobInterviewModal;
