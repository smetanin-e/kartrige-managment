import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cartridge } from "@/types/cartridge";

interface CartridgeCardProps {
  cartridge: Cartridge;
  onDragStart?: (e: React.DragEvent, cartridge: Cartridge) => void;
}

export function CartridgeCard({ cartridge, onDragStart }: CartridgeCardProps) {
  return (
    <Card 
      className="cursor-move hover:shadow-md transition-shadow"
      draggable
      onDragStart={(e) => onDragStart?.(e, cartridge)}
    >
      <CardContent className="p-3">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{cartridge.number}</span>
            <Badge variant="outline" className="text-xs">
              {cartridge.model}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
