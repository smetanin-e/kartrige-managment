import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/shared/components/ui';

interface Props {
  className?: string;
  openPopup: boolean;
  closePopup: () => void;
}

export const AddNewCartridge: React.FC<Props> = ({ openPopup, closePopup }) => {
  return (
    <Dialog open={openPopup} onOpenChange={closePopup}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить картридж</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <Label htmlFor='cartridge-number'>Номер картриджа</Label>
            <Input
              id='cartridge-number'
              placeholder='Например, МК101'
              //value={newNumber}
              //onChange={(e) => setNewNumber(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor='cartridge-model'>Модель</Label>
            <Input
              id='cartridge-model'
              placeholder='Например, CE505A'
              //value={newModel}
              //onChange={(e) => setNewModel(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={closePopup}>
            Отмена
          </Button>
          <Button onClick={() => alert('handleSaveNewCartridge')}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
