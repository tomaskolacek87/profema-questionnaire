import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * Astraia Patient Entity - read-only mapping
 * This is the Astraia database patient table structure
 * IMPORTANT: We only write minimal data here during patient creation
 */
@Entity('patients', { schema: 'public' })
export class AstraiaPatient {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'date' })
  birth_date: Date;

  @Column({ type: 'varchar', length: 20, unique: true })
  @Index()
  birth_number: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  insurance_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  insurance_company: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  postal_code: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
