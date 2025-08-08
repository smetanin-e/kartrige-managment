'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { ArrowLeft, Package, CheckCircle, Clock, AlertCircle, Eye, Calendar } from 'lucide-react';
import Link from 'next/link';
import {
  Cartridge,
  ServiceBatch,
  BatchReturn,
  BatchStatus,
  CartridgeReturn,
} from '@/types/cartridge';

// Демо данные партий в сервисе
const demoServiceBatches: ServiceBatch[] = [
  {
    id: '1',
    batchNumber: 'SB-001234',
    date: '2024-01-15',
    cartridges: [
      { id: '1', number: 'МК101', model: 'CE505A', status: 'service' },
      { id: '2', number: 'МК102', model: 'CE505A', status: 'service' },
      { id: '3', number: 'МК103', model: 'CF280A', status: 'service' },
    ],
    responsible: 'Иванов И.И.',
    notes: 'Срочная заправка',
    createdAt: new Date('2024-01-15'),
    status: 'in_progress',
  },
  {
    id: '2',
    batchNumber: 'SB-001235',
    date: '2024-01-16',
    cartridges: [
      { id: '4', number: 'МК104', model: 'CE505A', status: 'service' },
      { id: '5', number: 'МК105', model: 'CF280A', status: 'service' },
    ],
    responsible: 'Петров П.П.',
    createdAt: new Date('2024-01-16'),
    status: 'in_progress',
  },
  {
    id: '3',
    batchNumber: 'SB-001236',
    date: '2024-01-14',
    cartridges: [
      {
        id: '6',
        number: 'МК106',
        model: 'CB435A',
        status: 'available',
        returnDate: '2024-01-20',
        returnResponsible: 'Морозов М.М.',
      },
      {
        id: '7',
        number: 'МК107',
        model: 'CE505A',
        status: 'available',
        returnDate: '2024-01-20',
        returnResponsible: 'Морозов М.М.',
      },
    ],
    responsible: 'Сидоров С.С.',
    createdAt: new Date('2024-01-14'),
    status: 'completed',
    cartridgeReturns: [
      {
        cartridgeId: '6',
        returnDate: '2024-01-20',
        responsible: 'Морозов М.М.',
        notes: 'Заправлен полностью',
      },
      {
        cartridgeId: '7',
        returnDate: '2024-01-20',
        responsible: 'Морозов М.М.',
        notes: 'Заправлен полностью',
      },
    ],
  },
  {
    id: '4',
    batchNumber: 'SB-001237',
    date: '2024-01-13',
    cartridges: [
      {
        id: '8',
        number: 'МК108',
        model: 'CE505A',
        status: 'available',
        returnDate: '2024-01-18',
        returnResponsible: 'Козлов К.К.',
      },
      { id: '9', number: 'МК109', model: 'CF280A', status: 'service' },
      { id: '10', number: 'МК110', model: 'CB435A', status: 'service' },
    ],
    responsible: 'Козлов К.К.',
    createdAt: new Date('2024-01-13'),
    status: 'partial_return',
    returnedCartridges: ['8'],
    partialReturnDate: '2024-01-18',
    partialReturnResponsible: 'Козлов К.К.',
    cartridgeReturns: [
      {
        cartridgeId: '8',
        returnDate: '2024-01-18',
        responsible: 'Козлов К.К.',
        notes: 'Первая партия возврата',
      },
    ],
  },
];

interface ReturnFormData {
  returnDate: string;
  responsible: string;
  notes: string;
}

export default function ServiceReturnPage() {
  const [serviceBatches, setServiceBatches] = useState<ServiceBatch[]>(demoServiceBatches);
  const [selectedBatch, setSelectedBatch] = useState<ServiceBatch | null>(null);
  const [selectedCartridges, setSelectedCartridges] = useState<string[]>([]);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReturnFormData>({
    defaultValues: {
      returnDate: new Date().toISOString().split('T')[0],
    },
  });

  const getBatchStatusBadge = (status: BatchStatus) => {
    const statusMap = {
      in_progress: { label: 'В стадии заправки', color: 'bg-orange-500', icon: Clock },
      completed: { label: 'Выполнено', color: 'bg-green-500', icon: CheckCircle },
      partial_return: { label: 'Частичный возврат', color: 'bg-yellow-500', icon: AlertCircle },
    };

    const config = statusMap[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className='h-3 w-3' />
        {config.label}
      </Badge>
    );
  };

  const getAvailableCartridges = (batch: ServiceBatch) => {
    return batch.cartridges.filter((c) => c.status === 'service');
  };

  const getReturnedCartridges = (batch: ServiceBatch) => {
    return batch.cartridges.filter((c) => batch.returnedCartridges?.includes(c.id));
  };

  const getCartridgeReturnInfo = (batch: ServiceBatch, cartridgeId: string) => {
    return batch.cartridgeReturns?.find((cr) => cr.cartridgeId === cartridgeId);
  };

  const handleCartridgeSelect = (cartridgeId: string, checked: boolean) => {
    if (checked) {
      setSelectedCartridges((prev) => [...prev, cartridgeId]);
    } else {
      setSelectedCartridges((prev) => prev.filter((id) => id !== cartridgeId));
    }
  };

  const handleSelectAll = (batch: ServiceBatch, checked: boolean) => {
    const availableIds = getAvailableCartridges(batch).map((c) => c.id);
    if (checked) {
      setSelectedCartridges(availableIds);
    } else {
      setSelectedCartridges([]);
    }
  };

  const openReturnDialog = (batch: ServiceBatch) => {
    setSelectedBatch(batch);
    setSelectedCartridges([]);
    setShowReturnDialog(true);
    reset({
      returnDate: new Date().toISOString().split('T')[0],
      responsible: '',
      notes: '',
    });
  };

  const onSubmit = (data: ReturnFormData) => {
    if (!selectedBatch || selectedCartridges.length === 0) {
      alert('Выберите картриджи для приема');
      return;
    }

    const availableCartridges = getAvailableCartridges(selectedBatch);
    const isFullReturn = selectedCartridges.length === availableCartridges.length;

    // Обновляем партию
    setServiceBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === selectedBatch.id) {
          const updatedBatch = { ...batch };

          // Создаем записи о возврате картриджей
          const newCartridgeReturns: CartridgeReturn[] = selectedCartridges.map((cartridgeId) => ({
            cartridgeId,
            returnDate: data.returnDate,
            responsible: data.responsible,
            notes: data.notes,
          }));

          updatedBatch.cartridgeReturns = [
            ...(updatedBatch.cartridgeReturns || []),
            ...newCartridgeReturns,
          ];

          if (isFullReturn) {
            // Полный возврат
            updatedBatch.status = 'completed';
            updatedBatch.cartridges = updatedBatch.cartridges.map((cartridge) =>
              selectedCartridges.includes(cartridge.id)
                ? {
                    ...cartridge,
                    status: 'available',
                    returnDate: data.returnDate,
                    returnResponsible: data.responsible,
                  }
                : cartridge,
            );
          } else {
            // Частичный возврат
            updatedBatch.status = 'partial_return';
            updatedBatch.returnedCartridges = [
              ...(updatedBatch.returnedCartridges || []),
              ...selectedCartridges,
            ];
            updatedBatch.partialReturnDate = data.returnDate;
            updatedBatch.partialReturnResponsible = data.responsible;
            updatedBatch.cartridges = updatedBatch.cartridges.map((cartridge) =>
              selectedCartridges.includes(cartridge.id)
                ? {
                    ...cartridge,
                    status: 'available',
                    returnDate: data.returnDate,
                    returnResponsible: data.responsible,
                  }
                : cartridge,
            );
          }

          return updatedBatch;
        }
        return batch;
      }),
    );

    // Закрываем диалог
    setShowReturnDialog(false);
    setSelectedBatch(null);
    setSelectedCartridges([]);
  };

  const getInProgressBatches = () => {
    return serviceBatches.filter(
      (batch) => batch.status === 'in_progress' || batch.status === 'partial_return',
    );
  };

  const getCompletedBatches = () => {
    return serviceBatches.filter((batch) => batch.status === 'completed');
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex items-center gap-4 mb-6'>
        <Link href='/'>
          <Button variant='outline' size='sm'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Назад
          </Button>
        </Link>
        <div>
          <h1 className='text-3xl font-bold'>Прием из сервиса</h1>
          <p className='text-muted-foreground'>
            Управление возвратом картриджей из сервисного центра
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <Clock className='h-5 w-5 text-orange-500' />
              <div>
                <p className='text-2xl font-bold'>{getInProgressBatches().length}</p>
                <p className='text-sm text-muted-foreground'>В работе</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <CheckCircle className='h-5 w-5 text-green-500' />
              <div>
                <p className='text-2xl font-bold'>{getCompletedBatches().length}</p>
                <p className='text-sm text-muted-foreground'>Выполнено</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-2'>
              <Package className='h-5 w-5 text-blue-500' />
              <div>
                <p className='text-2xl font-bold'>{serviceBatches.length}</p>
                <p className='text-sm text-muted-foreground'>Всего партий</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Партии в работе */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Партии в работе ({getInProgressBatches().length})</CardTitle>
        </CardHeader>
        <CardContent>
          {getInProgressBatches().length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>Нет партий в работе</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Номер партии</TableHead>
                  <TableHead>Дата отправки</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Картриджей</TableHead>
                  <TableHead>Ответственный</TableHead>
                  <TableHead className='text-right'>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getInProgressBatches().map((batch) => {
                  const availableCount = getAvailableCartridges(batch).length;
                  const returnedCount = getReturnedCartridges(batch).length;
                  const totalCount = batch.cartridges.length;

                  return (
                    <TableRow key={batch.id}>
                      <TableCell className='font-medium'>{batch.batchNumber}</TableCell>
                      <TableCell>{batch.date}</TableCell>
                      <TableCell>{getBatchStatusBadge(batch.status)}</TableCell>
                      <TableCell>
                        <div className='flex flex-col text-sm'>
                          <span>Всего: {totalCount}</span>
                          {batch.status === 'partial_return' && (
                            <>
                              <span className='text-green-600'>Вернулось: {returnedCount}</span>
                              <span className='text-orange-600'>Осталось: {availableCount}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{batch.responsible}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex gap-2 justify-end'>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant='outline' size='sm'>
                                <Eye className='h-4 w-4' />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-2xl'>
                              <DialogHeader>
                                <DialogTitle>Партия {batch.batchNumber}</DialogTitle>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <div className='grid grid-cols-2 gap-4 text-sm'>
                                  <div>
                                    <strong>Дата отправки:</strong> {batch.date}
                                  </div>
                                  <div>
                                    <strong>Ответственный:</strong> {batch.responsible}
                                  </div>
                                  <div>
                                    <strong>Статус:</strong> {getBatchStatusBadge(batch.status)}
                                  </div>
                                  {batch.partialReturnDate && (
                                    <div>
                                      <strong>Дата частичного возврата:</strong>{' '}
                                      {batch.partialReturnDate}
                                    </div>
                                  )}
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Номер</TableHead>
                                      <TableHead>Модель</TableHead>
                                      <TableHead>Статус</TableHead>
                                      <TableHead>Дата возврата</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {batch.cartridges.map((cartridge) => {
                                      const returnInfo = getCartridgeReturnInfo(
                                        batch,
                                        cartridge.id,
                                      );
                                      return (
                                        <TableRow key={cartridge.id}>
                                          <TableCell>{cartridge.number}</TableCell>
                                          <TableCell>{cartridge.model}</TableCell>
                                          <TableCell>
                                            <Badge
                                              variant={
                                                cartridge.status === 'available'
                                                  ? 'default'
                                                  : 'secondary'
                                              }
                                            >
                                              {cartridge.status === 'available'
                                                ? 'Возвращен'
                                                : 'В сервисе'}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            {returnInfo ? (
                                              <div className='flex items-center gap-1 text-sm'>
                                                <Calendar className='h-3 w-3' />
                                                {returnInfo.returnDate}
                                              </div>
                                            ) : (
                                              <span className='text-muted-foreground text-sm'>
                                                —
                                              </span>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size='sm'
                            onClick={() => openReturnDialog(batch)}
                            disabled={getAvailableCartridges(batch).length === 0}
                          >
                            Принять
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Выполненные партии */}
      <Card>
        <CardHeader>
          <CardTitle>Выполненные партии ({getCompletedBatches().length})</CardTitle>
        </CardHeader>
        <CardContent>
          {getCompletedBatches().length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>Нет выполненных партий</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Номер партии</TableHead>
                  <TableHead>Дата отправки</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Картриджей</TableHead>
                  <TableHead>Ответственный</TableHead>
                  <TableHead className='text-right'>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCompletedBatches().map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className='font-medium'>{batch.batchNumber}</TableCell>
                    <TableCell>{batch.date}</TableCell>
                    <TableCell>{getBatchStatusBadge(batch.status)}</TableCell>
                    <TableCell>{batch.cartridges.length}</TableCell>
                    <TableCell>{batch.responsible}</TableCell>
                    <TableCell className='text-right'>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant='outline' size='sm'>
                            <Eye className='h-4 w-4' />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-3xl'>
                          <DialogHeader>
                            <DialogTitle>Партия {batch.batchNumber} - Выполнено</DialogTitle>
                          </DialogHeader>
                          <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4 text-sm bg-green-50 p-4 rounded-lg'>
                              <div>
                                <strong>Дата отправки:</strong> {batch.date}
                              </div>
                              <div>
                                <strong>Ответственный за отправку:</strong> {batch.responsible}
                              </div>
                              <div>
                                <strong>Статус:</strong> {getBatchStatusBadge(batch.status)}
                              </div>
                              <div>
                                <strong>Всего картриджей:</strong> {batch.cartridges.length}
                              </div>
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Номер</TableHead>
                                  <TableHead>Модель</TableHead>
                                  <TableHead>Дата возврата</TableHead>
                                  <TableHead>Принял</TableHead>
                                  <TableHead>Примечания</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {batch.cartridges.map((cartridge) => {
                                  const returnInfo = getCartridgeReturnInfo(batch, cartridge.id);
                                  return (
                                    <TableRow key={cartridge.id}>
                                      <TableCell className='font-medium'>
                                        {cartridge.number}
                                      </TableCell>
                                      <TableCell>{cartridge.model}</TableCell>
                                      <TableCell>
                                        {returnInfo ? (
                                          <div className='flex items-center gap-1'>
                                            <Calendar className='h-3 w-3 text-green-600' />
                                            <span className='text-green-700 font-medium'>
                                              {returnInfo.returnDate}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className='text-muted-foreground'>—</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {returnInfo?.responsible ||
                                          cartridge.returnResponsible ||
                                          '—'}
                                      </TableCell>
                                      <TableCell>
                                        <span className='text-sm text-muted-foreground'>
                                          {returnInfo?.notes || '—'}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Диалог приема партии */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Прием партии {selectedBatch?.batchNumber}</DialogTitle>
          </DialogHeader>

          {selectedBatch && (
            <div className='space-y-6'>
              {/* Информация о партии */}
              <div className='grid grid-cols-2 gap-4 text-sm bg-muted p-4 rounded-lg'>
                <div>
                  <strong>Дата отправки:</strong> {selectedBatch.date}
                </div>
                <div>
                  <strong>Ответственный за отправку:</strong> {selectedBatch.responsible}
                </div>
                <div>
                  <strong>Статус:</strong> {getBatchStatusBadge(selectedBatch.status)}
                </div>
                <div>
                  <strong>Всего картриджей:</strong> {selectedBatch.cartridges.length}
                </div>
              </div>

              {/* Выбор картриджей */}
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold'>
                    Выберите картриджи для приема ({getAvailableCartridges(selectedBatch).length}{' '}
                    доступно)
                  </h3>
                  <div className='flex items-center space-x-2'>
                    <Checkbox
                      id='select-all-return'
                      checked={
                        selectedCartridges.length === getAvailableCartridges(selectedBatch).length
                      }
                      onCheckedChange={(checked) =>
                        handleSelectAll(selectedBatch, checked as boolean)
                      }
                    />
                    <Label htmlFor='select-all-return' className='text-sm'>
                      Выбрать все
                    </Label>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12'></TableHead>
                      <TableHead>Номер</TableHead>
                      <TableHead>Модель</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата возврата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBatch.cartridges.map((cartridge) => {
                      const isReturned = selectedBatch.returnedCartridges?.includes(cartridge.id);
                      const isAvailable = cartridge.status === 'service';
                      const returnInfo = getCartridgeReturnInfo(selectedBatch, cartridge.id);

                      return (
                        <TableRow key={cartridge.id} className={isReturned ? 'bg-green-50' : ''}>
                          <TableCell>
                            {isAvailable ? (
                              <Checkbox
                                checked={selectedCartridges.includes(cartridge.id)}
                                onCheckedChange={(checked) =>
                                  handleCartridgeSelect(cartridge.id, checked as boolean)
                                }
                              />
                            ) : (
                              <CheckCircle className='h-4 w-4 text-green-500' />
                            )}
                          </TableCell>
                          <TableCell className='font-medium'>{cartridge.number}</TableCell>
                          <TableCell>{cartridge.model}</TableCell>
                          <TableCell>
                            <Badge variant={isReturned ? 'default' : 'secondary'}>
                              {isReturned ? 'Уже возвращен' : 'В сервисе'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {returnInfo ? (
                              <div className='flex items-center gap-1 text-sm'>
                                <Calendar className='h-3 w-3 text-green-600' />
                                <span className='text-green-700'>{returnInfo.returnDate}</span>
                              </div>
                            ) : (
                              <span className='text-muted-foreground text-sm'>—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Форма приема */}
              <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='returnDate'>Дата приема</Label>
                    <Input
                      id='returnDate'
                      type='date'
                      {...register('returnDate', { required: 'Дата обязательна' })}
                    />
                    {errors.returnDate && (
                      <p className='text-sm text-red-500 mt-1'>{errors.returnDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor='responsible'>Ответственный за прием</Label>
                    <Input
                      id='responsible'
                      placeholder='ФИО ответственного'
                      {...register('responsible', { required: 'Ответственный обязателен' })}
                    />
                    {errors.responsible && (
                      <p className='text-sm text-red-500 mt-1'>{errors.responsible.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor='notes'>Примечания</Label>
                  <Textarea
                    id='notes'
                    placeholder='Состояние картриджей, особые отметки...'
                    {...register('notes')}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setShowReturnDialog(false)}
                  >
                    Отмена
                  </Button>
                  <Button type='submit' disabled={selectedCartridges.length === 0}>
                    Принять ({selectedCartridges.length} шт.)
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
