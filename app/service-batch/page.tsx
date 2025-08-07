"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Send, Printer, Eye, Package } from 'lucide-react';
import Link from "next/link";
import { Cartridge, ServiceBatch } from "@/types/cartridge";

// Демо данные картриджей
const demoCartridges: Cartridge[] = [
  { id: '1', number: 'МК101', model: 'CE505A', status: 'refill' },
  { id: '2', number: 'МК102', model: 'CE505A', status: 'refill' },
  { id: '3', number: 'МК103', model: 'CF280A', status: 'reserve' },
  { id: '4', number: 'МК104', model: 'CE505A', status: 'refill' },
  { id: '5', number: 'МК105', model: 'CF280A', status: 'reserve' },
  { id: '6', number: 'МК106', model: 'CB435A', status: 'refill' },
  { id: '7', number: 'МК107', model: 'CE505A', status: 'reserve' },
];

interface BatchFormData {
  batchNumber: string;
  date: string;
  responsible: string;
  notes: string;
}

export default function ServiceBatchPage() {
  const [cartridges, setCartridges] = useState<Cartridge[]>(demoCartridges);
  const [selectedCartridges, setSelectedCartridges] = useState<string[]>([]);
  const [serviceBatches, setServiceBatches] = useState<ServiceBatch[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BatchFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      batchNumber: `SB-${Date.now().toString().slice(-6)}`
    }
  });

  // Получаем картриджи доступные для отправки в сервис
  const getAvailableForService = () => {
    return cartridges.filter(c => c.status === 'refill' || c.status === 'reserve');
  };

  const handleCartridgeSelect = (cartridgeId: string, checked: boolean) => {
    if (checked) {
      setSelectedCartridges(prev => [...prev, cartridgeId]);
    } else {
      setSelectedCartridges(prev => prev.filter(id => id !== cartridgeId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const availableIds = getAvailableForService().map(c => c.id);
      setSelectedCartridges(availableIds);
    } else {
      setSelectedCartridges([]);
    }
  };

  const onSubmit = (data: BatchFormData) => {
    if (selectedCartridges.length === 0) {
      alert('Выберите хотя бы один картридж для отправки');
      return;
    }

    const selectedCartridgeObjects = cartridges.filter(c => selectedCartridges.includes(c.id));

    // Создаем новую партию
    const newBatch: ServiceBatch = {
      id: Date.now().toString(),
      batchNumber: data.batchNumber,
      date: data.date,
      cartridges: selectedCartridgeObjects,
      responsible: data.responsible,
      notes: data.notes,
      createdAt: new Date()
    };

    // Обновляем статусы картриджей на "в сервисе"
    setCartridges(prev => prev.map(cartridge => 
      selectedCartridges.includes(cartridge.id) 
        ? { ...cartridge, status: 'service' }
        : cartridge
    ));

    // Добавляем партию в список
    setServiceBatches(prev => [newBatch, ...prev]);

    // Очищаем выбор и форму
    setSelectedCartridges([]);
    reset({
      date: new Date().toISOString().split('T')[0],
      batchNumber: `SB-${Date.now().toString().slice(-6)}`,
      responsible: '',
      notes: ''
    });

    // Показываем предварительный просмотр для печати
    setShowPreview(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'refill': { label: 'В заправке', color: 'bg-purple-500' },
      'reserve': { label: 'В резерве', color: 'bg-blue-500' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap];
    return (
      <Badge className={`${statusInfo.color} text-white text-xs`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const printBatch = (batch: ServiceBatch) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ведомость отправки в сервис - ${batch.batchNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .info { margin-bottom: 20px; }
              .info div { margin: 5px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .footer { margin-top: 30px; }
              .signature { margin-top: 50px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ВЕДОМОСТЬ ОТПРАВКИ КАРТРИДЖЕЙ В СЕРВИС</h1>
              <h2>№ ${batch.batchNumber}</h2>
            </div>
            
            <div class="info">
              <div><strong>Дата:</strong> ${batch.date}</div>
              <div><strong>Ответственный:</strong> ${batch.responsible}</div>
              <div><strong>Количество картриджей:</strong> ${batch.cartridges.length} шт.</div>
              ${batch.notes ? `<div><strong>Примечания:</strong> ${batch.notes}</div>` : ''}
            </div>

            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Номер картриджа</th>
                  <th>Модель</th>
                  <th>Предыдущий статус</th>
                </tr>
              </thead>
              <tbody>
                ${batch.cartridges.map((cartridge, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${cartridge.number}</td>
                    <td>${cartridge.model}</td>
                    <td>${cartridge.status === 'service' ? 'В заправке/В резерве' : cartridge.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="signature">
              <p>Ответственный за отправку: _________________ ${batch.responsible}</p>
              <p>Дата: ${batch.date}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const availableForService = getAvailableForService();
  const isAllSelected = availableForService.length > 0 && selectedCartridges.length === availableForService.length;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Отправка в сервис</h1>
          <p className="text-muted-foreground">
            Формирование партий картриджей для отправки в сервисный центр
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список доступных картриджей */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Доступные для отправки ({availableForService.length})
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm">
                    Выбрать все
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {availableForService.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Нет картриджей доступных для отправки в сервис
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Номер</TableHead>
                      <TableHead>Модель</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableForService.map((cartridge) => (
                      <TableRow key={cartridge.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCartridges.includes(cartridge.id)}
                            onCheckedChange={(checked) => 
                              handleCartridgeSelect(cartridge.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">{cartridge.number}</TableCell>
                        <TableCell>{cartridge.model}</TableCell>
                        <TableCell>{getStatusBadge(cartridge.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Форма создания партии */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Данные партии</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="batchNumber">Номер партии</Label>
                  <Input
                    id="batchNumber"
                    {...register("batchNumber", { required: "Номер партии обязателен" })}
                  />
                  {errors.batchNumber && (
                    <p className="text-sm text-red-500 mt-1">{errors.batchNumber.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="date">Дата отправки</Label>
                  <Input
                    id="date"
                    type="date"
                    {...register("date", { required: "Дата обязательна" })}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="responsible">Ответственный</Label>
                  <Input
                    id="responsible"
                    placeholder="ФИО ответственного"
                    {...register("responsible", { required: "Ответственный обязателен" })}
                  />
                  {errors.responsible && (
                    <p className="text-sm text-red-500 mt-1">{errors.responsible.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Примечания</Label>
                  <Textarea
                    id="notes"
                    placeholder="Дополнительная информация..."
                    {...register("notes")}
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-4">
                    Выбрано картриджей: <strong>{selectedCartridges.length}</strong>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={selectedCartridges.length === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Отправить в сервис
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* История отправок */}
      {serviceBatches.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>История отправок в сервис</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Номер партии</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Количество</TableHead>
                  <TableHead>Ответственный</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                    <TableCell>{batch.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {batch.cartridges.length} шт.
                      </Badge>
                    </TableCell>
                    <TableCell>{batch.responsible}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Партия {batch.batchNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><strong>Дата:</strong> {batch.date}</div>
                                <div><strong>Ответственный:</strong> {batch.responsible}</div>
                                <div><strong>Количество:</strong> {batch.cartridges.length} шт.</div>
                                {batch.notes && <div><strong>Примечания:</strong> {batch.notes}</div>}
                              </div>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Номер</TableHead>
                                    <TableHead>Модель</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {batch.cartridges.map((cartridge) => (
                                    <TableRow key={cartridge.id}>
                                      <TableCell>{cartridge.number}</TableCell>
                                      <TableCell>{cartridge.model}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => printBatch(batch)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
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
