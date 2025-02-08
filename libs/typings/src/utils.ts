import { Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

export type StaticImplements<I extends Type, C extends I> = InstanceType<C>;

export type InjectionBypass<T> = new (moduleRef: ModuleRef) => T;
