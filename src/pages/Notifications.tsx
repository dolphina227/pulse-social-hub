import { Card, CardContent } from '@/components/ui/card';
import { NotificationList } from '@/components/NotificationList';

export default function Notifications() {
  return (
    <div className="max-w-2xl mx-auto pt-16 md:pt-0">
      <div className="border-b border-border/50 p-4 sticky top-16 md:top-0 bg-background/95 backdrop-blur z-10">
        <h2 className="text-xl font-bold">Notifications</h2>
      </div>

      <Card className="border-0 shadow-none rounded-none">
        <CardContent className="p-0">
          <NotificationList />
        </CardContent>
      </Card>
    </div>
  );
}
