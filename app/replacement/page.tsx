'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import Link from 'next/link';
import { Cartridge, CartridgeReplacement } from '@/types/cartridge';

// Демо данные картриджей
const availableCartridges: Cartridge[] = [
  { id: '1', number: 'МК101', model: 'CE505A', status: 'available' },
  { id: '2', number: 'МК102', model: 'CE505A', status: 'available' },
  { id: '3', number: 'МК103', model: 'CF280A', status: 'working' },
  { id: '4', number: 'МК104', model: 'CE505A', status: 'reserve' },
  { id: '5', number: 'МК105', model: 'CF280A', status: 'working' },
];

const departments = [
  'Бухгалтерия',
  'Отдел кадров',
  'IT отдел',
  'Юридический отдел',
  'Отдел продаж',
  'Производство',
];

interface ReplacementFormData {
  date: string;
  department: string;
  installedCartridge: string;
  removedCartridge: string;
  responsible: string;
}

export default function ReplacementPage() {
  const [cartridges, setCartridges] = useState<Cartridge[]>(availableCartridges);
  const [replacements, setReplacements] = useState<CartridgeReplacement[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReplacementFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const watchedValues = watch();

  const onSubmit = (data: ReplacementFormData) => {
    // Создаем новую запись замены
    const newReplacement: CartridgeReplacement = {
      id: Date.now().toString(),
      date: data.date,
      department: data.department,
      installedCartridgeNumber: data.installedCartridge,
      removedCartridgeNumber: data.removedCartridge,
      responsible: data.responsible,
      createdAt: new Date(),
    };

    // Обновляем статусы картриджей
    setCartridges((prev) =>
      prev.map((cartridge) => {
        if (cartridge.number === data.installedCartridge) {
          return { ...cartridge, status: 'working' };
        }
        if (cartridge.number === data.removedCartridge) {
          return { ...cartridge, status: 'refill' };
        }
        return cartridge;
      }),
    );

    // Добавляем запись в таблицу
    setReplacements((prev) => [newReplacement, ...prev]);

    // Очищаем форму
    reset({
      date: new Date().toISOString().split('T')[0],
      department: '',
      installedCartridge: '',
      removedCartridge: '',
      responsible: '',
    });
  };

  const getAvailableCartridges = () => {
    return cartridges.filter((c) => c.status === 'available' || c.status === 'reserve');
  };

  const getWorkingCartridges = () => {
    return cartridges.filter((c) => c.status === 'working');
  };

  const getStatusBadge = (cartridge: Cartridge) => {
    const statusMap = {
      available: { label: 'Готовы к использованию', color: 'bg-green-500' },
      reserve: { label: 'Сняты с обслуживания', color: 'bg-blue-500' },
      working: { label: 'В работе', color: 'bg-orange-500' },
      service: { label: 'В сервисе', color: 'bg-red-500' },
      refill: { label: 'Требуется заправка', color: 'bg-purple-500' },
    };

    const status = statusMap[cartridge.status];
    return <Badge className={`${status.color} text-white text-xs`}>{status.label}</Badge>;
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
          <h1 className='text-3xl font-bold'>Замена картриджа</h1>
          <p className='text-muted-foreground'>Заполните форму для регистрации замены картриджа</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Форма замены */}
        <Card>
          <CardHeader>
            <CardTitle>Форма замены картриджа</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div>
                <Label htmlFor='date'>Дата</Label>
                <Input
                  id='date'
                  type='date'
                  {...register('date', { required: 'Дата обязательна' })}
                />
                {errors.date && <p className='text-sm text-red-500'>{errors.date.message}</p>}
              </div>

              <div>
                <Label htmlFor='department'>Подразделение</Label>
                <Select onValueChange={(value) => setValue('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите подразделение' />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className='text-sm text-red-500 mt-1'>{errors.department.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor='installedCartridge'>Установленный картридж</Label>
                <Select onValueChange={(value) => setValue('installedCartridge', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите картридж для установки' />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCartridges().map((cartridge) => (
                      <SelectItem key={cartridge.id} value={cartridge.number}>
                        <div className='flex items-center gap-2'>
                          <span>
                            {cartridge.number} ({cartridge.model})
                          </span>
                          {getStatusBadge(cartridge)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.installedCartridge && (
                  <p className='text-sm text-red-500 mt-1'>{errors.installedCartridge.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor='removedCartridge'>Снятый картридж</Label>
                <Select onValueChange={(value) => setValue('removedCartridge', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder='Выберите картридж для снятия' />
                  </SelectTrigger>
                  <SelectContent>
                    {getWorkingCartridges().map((cartridge) => (
                      <SelectItem key={cartridge.id} value={cartridge.number}>
                        <div className='flex items-center gap-2'>
                          <span>
                            {cartridge.number} ({cartridge.model})
                          </span>
                          {getStatusBadge(cartridge)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.removedCartridge && (
                  <p className='text-sm text-red-500 mt-1'>{errors.removedCartridge.message}</p>
                )}
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='responsible'>Ответственный</Label>
                <Input
                  id='responsible'
                  placeholder='ФИО ответственного'
                  {...register('responsible', { required: 'Ответственный обязателен' })}
                />
                {errors.responsible && (
                  <p className='text-sm text-red-500 -translate-y-2'>
                    {errors.responsible.message}
                  </p>
                )}
              </div>

              <Button type='submit' className='w-full'>
                <Save className='h-4 w-4 mr-2' />
                Сохранить замену
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Предварительный просмотр */}
        <Card>
          <CardHeader>
            <CardTitle>Предварительный просмотр</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='font-medium'>Дата:</span>
                <span>{watchedValues.date || '—'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>Подразделение:</span>
                <span>{watchedValues.department || '—'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>Установлен:</span>
                <span>{watchedValues.installedCartridge || '—'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>Снят:</span>
                <span>{watchedValues.removedCartridge || '—'}</span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>Ответственный:</span>
                <span>{watchedValues.responsible || '—'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Таблица замен */}
      {replacements.length > 0 && (
        <Card className='mt-6'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>История замен</CardTitle>
              <Button variant='outline' size='sm'>
                <Printer className='h-4 w-4 mr-2' />
                Печать
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Подразделение</TableHead>
                  <TableHead>Установлен</TableHead>
                  <TableHead>Снят</TableHead>
                  <TableHead>Ответственный</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {replacements.map((replacement) => (
                  <TableRow key={replacement.id}>
                    <TableCell>{replacement.date}</TableCell>
                    <TableCell>{replacement.department}</TableCell>
                    <TableCell>
                      <Badge variant='outline' className='bg-orange-50 text-orange-700'>
                        {replacement.installedCartridgeNumber}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline' className='bg-purple-50 text-purple-700'>
                        {replacement.removedCartridgeNumber}
                      </Badge>
                    </TableCell>
                    <TableCell>{replacement.responsible}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
