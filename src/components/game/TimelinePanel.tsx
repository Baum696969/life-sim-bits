import { TimelineEvent } from '@/types/game';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimelinePanelProps {
  timeline: TimelineEvent[];
}

const TimelinePanel = ({ timeline }: TimelinePanelProps) => {
  return (
    <div className="bg-card rounded-lg p-4 card-glow h-[500px]">
      <h3 className="font-display text-lg text-primary mb-4">Timeline</h3>
      
      <ScrollArea className="h-[430px] pr-4">
        {timeline.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            Dein Leben beginnt...
          </p>
        ) : (
          <div className="space-y-4">
            {timeline.map((event) => (
              <div key={event.id} className="timeline-item pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display text-sm text-primary">
                    {event.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Alter {event.age}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default TimelinePanel;
