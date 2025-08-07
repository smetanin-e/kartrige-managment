export interface Cartridge {
  id: string;
  number: string; // МК101
  model: string;  // CE505A
  status: CartridgeStatus;
  returnDate?: string; // Дата возврата из сервиса
  returnResponsible?: string; // Ответственный за прием
}

// Обновляем тип статуса, добавляя "refill" (в заправке)
export type CartridgeStatus = 'service' | 'working' | 'reserve' | 'available' | 'refill';

// Добавляем интерфейс для записи замены
export interface CartridgeReplacement {
  id: string;
  date: string;
  department: string;
  installedCartridgeNumber: string;
  removedCartridgeNumber: string;
  responsible: string;
  createdAt: Date;
}

// Обновляем интерфейс для партии отправки в сервис
export interface ServiceBatch {
  id: string;
  batchNumber: string;
  date: string;
  cartridges: Cartridge[];
  responsible: string;
  notes?: string;
  createdAt: Date;
  status: BatchStatus;
  returnedCartridges?: string[]; // ID возвращенных картриджей
  partialReturnDate?: string;
  partialReturnResponsible?: string;
  // Добавляем информацию о возвратах картриджей
  cartridgeReturns?: CartridgeReturn[];
}

export type BatchStatus = 'in_progress' | 'completed' | 'partial_return';

// Добавляем интерфейс для отслеживания возврата отдельных картриджей
export interface CartridgeReturn {
  cartridgeId: string;
  returnDate: string;
  responsible: string;
  notes?: string;
}

// Добавляем интерфейс для приема партии
export interface BatchReturn {
  id: string;
  batchId: string;
  returnDate: string;
  returnedCartridgeIds: string[];
  responsible: string;
  notes?: string;
  isPartial: boolean;
}

export interface StatusCell {
  id: CartridgeStatus;
  title: string;
  color: string;
  cartridges: Cartridge[];
}
