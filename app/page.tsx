'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, MoreHorizontal, Edit, Package, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Cartridge, CartridgeStatus } from '@/types/cartridge';

// Начальные данные для демонстрации
const initialCartridges: Cartridge[] = [
  { id: '1', number: 'МК101', model: 'CE505A', status: 'available' },
  { id: '2', number: 'МК102', model: 'CE505A', status: 'available' },
  { id: '3', number: 'МК103', model: 'CF280A', status: 'working' },
  { id: '4', number: 'МК104', model: 'CE505A', status: 'service' },
  { id: '5', number: 'МК105', model: 'CF280A', status: 'reserve' },
  { id: '6', number: 'МК106', model: 'CE505A', status: 'working' },
  { id: '7', number: 'МК107', model: 'CB435A', status: 'refill' },
  { id: '8', number: 'МК108', model: 'CE505A', status: 'refill' },
];

const statusConfig = {
  available: {
    label: 'Готовы к использованию',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  reserve: {
    label: 'Сняты с обслуживания',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  working: {
    label: 'В работе',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
  service: {
    label: 'В сервисе',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
  },
  refill: {
    label: 'Требуется заправка',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
};

export default function HomePage() {
  const [cartridges, setCartridges] = useState<Cartridge[]>(initialCartridges);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CartridgeStatus | 'all'>('all');

  const filteredCartridges = cartridges.filter((cartridge) => {
    const matchesSearch =
      cartridge.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cartridge.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cartridge.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: CartridgeStatus) => {
    const config = statusConfig[status];
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  const changeCartridgeStatus = (cartridgeId: string, newStatus: CartridgeStatus) => {
    setCartridges((prev) =>
      prev.map((cartridge) =>
        cartridge.id === cartridgeId ? { ...cartridge, status: newStatus } : cartridge,
      ),
    );
  };

  const addNewCartridge = () => {
    const newCartridge: Cartridge = {
      id: Date.now().toString(),
      number: `МК${Math.floor(Math.random() * 1000) + 100}`,
      model: ['CE505A', 'CF280A', 'CB435A'][Math.floor(Math.random() * 3)],
      status: 'available',
    };

    setCartridges((prev) => [...prev, newCartridge]);
  };

  const getStatusCount = (status: CartridgeStatus) => {
    return cartridges.filter((c) => c.status === status).length;
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Управление картриджами</h1>
          <p className='text-muted-foreground mt-2'>
            Управление статусами и отслеживание картриджей
          </p>
        </div>
        <div className='flex gap-2'>
          <Link href='/replacement'>
            <Button variant='outline' className='flex items-center gap-2'>
              <Edit className='h-4 w-4' />
              Замена картриджа
            </Button>
          </Link>
          <Link href='/service-batch'>
            <Button variant='outline' className='flex items-center gap-2'>
              <Package className='h-4 w-4' />
              Отправка в сервис
            </Button>
          </Link>
          <Link href='/service-return'>
            <Button variant='outline' className='flex items-center gap-2'>
              <Download className='h-4 w-4' />
              Прием из сервиса
            </Button>
          </Link>
          <Button onClick={addNewCartridge} className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            Добавить картридж
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-6'>
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = getStatusCount(status as CartridgeStatus);
          return (
            <Card key={status}>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                  <div>
                    <p className='text-2xl font-bold'>{count}</p>
                    <p className='text-sm text-muted-foreground'>{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Фильтры и поиск */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Поиск по номеру или модели...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='w-full md:w-48'>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as CartridgeStatus | 'all')}
              >
                <SelectTrigger>
                  <Filter className='h-4 w-4 mr-2' />
                  <SelectValue placeholder='Статус' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Все статусы</SelectItem>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица картриджей */}
      <Card>
        <CardHeader>
          <CardTitle>
            Картриджи ({filteredCartridges.length} из {cartridges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Номер</TableHead>
                <TableHead>Модель</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className='text-right'>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCartridges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='text-center py-8 text-muted-foreground'>
                    Картриджи не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredCartridges.map((cartridge) => (
                  <TableRow key={cartridge.id}>
                    <TableCell className='font-medium'>{cartridge.number}</TableCell>
                    <TableCell>{cartridge.model}</TableCell>
                    <TableCell>{getStatusBadge(cartridge.status)}</TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          {Object.entries(statusConfig).map(([status, config]) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() =>
                                changeCartridgeStatus(cartridge.id, status as CartridgeStatus)
                              }
                              disabled={cartridge.status === status}
                            >
                              <div className={`w-2 h-2 rounded-full ${config.color} mr-2`}></div>
                              {config.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
