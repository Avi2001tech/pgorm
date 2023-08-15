// src/entities/SpamNumber.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class SpamNumber {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phoneNumber: string;
}
