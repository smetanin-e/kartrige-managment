import { Cartridge } from '@prisma/client';
import { axiosInstance } from './instance';
import { ApiRoutes } from './constants';

export const getAllCarteiges = async (): Promise<Cartridge[]> => {
  return (await axiosInstance.get<Cartridge[]>(ApiRoutes.CARTRIGES)).data;
};
