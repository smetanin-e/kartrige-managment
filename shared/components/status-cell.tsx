import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { CartridgeCard } from './cartridge-card';
import { Cartridge, CartridgeStatus } from '@/types/cartridge';

interface StatusCellProps {
  title: string;
  status: CartridgeStatus;
  cartridges: Cartridge[];
  color: string;
  onDragStart: (e: React.DragEvent, cartridge: Cartridge) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetStatus: CartridgeStatus) => void;
}

export function StatusCell({
  title,
  status,
  cartridges,
  color,
  onDragStart,
  onDragOver,
  onDrop,
}: StatusCellProps) {
  return (
    <Card
      className='h-full min-h-[400px]'
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between'>
          <span className='text-lg'>{title}</span>
          <Badge variant='secondary' className={`${color} text-white`}>
            {cartridges.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        {cartridges.length === 0 ? (
          <div className='text-center text-muted-foreground py-8'>Нет картриджей</div>
        ) : (
          cartridges.map((cartridge) => (
            <CartridgeCard key={cartridge.id} cartridge={cartridge} onDragStart={onDragStart} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
