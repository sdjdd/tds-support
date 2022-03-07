import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMockRepository } from '@/common/mocks';
import { Organization } from './entities/organization.entity';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  let mockRepository: Repository<Organization>;
  let organizationsService: OrganizationsService;

  beforeEach(async () => {
    mockRepository = createMockRepository();

    const module = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getRepositoryToken(Organization),
          useValue: mockRepository,
        },
      ],
    }).compile();

    organizationsService = module.get(OrganizationsService);
  });

  describe('create', () => {
    it('should insert with organization repository', async () => {
      const spy = jest.spyOn(mockRepository, 'insert');
      await organizationsService.create({
        name: 'xd',
        description: 'xd company',
      });
      expect(spy.mock.calls[0][0]).toEqual({
        name: 'xd',
        description: 'xd company',
      });
    });

    it('should fill default values', async () => {
      const spy = jest.spyOn(mockRepository, 'insert');
      await organizationsService.create({
        name: 'xd',
      });
      expect(spy.mock.calls[0][0]).toEqual({
        name: 'xd',
        description: '',
      });
    });
  });

  describe('find', () => {
    it('should call find directly', async () => {
      const spy = jest.spyOn(mockRepository, 'find');
      await organizationsService.find();
      expect(spy.mock.calls.length).toBe(1);
    });
  });

  describe('findOrFail', () => {
    it('should throw NotFoundException when no data returned', () => {
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue(undefined);
      expect(organizationsService.findOneOrFail(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should ok', async () => {
      const spyUpdate = jest.spyOn(mockRepository, 'update');
      jest
        .spyOn(mockRepository, 'findOne')
        .mockResolvedValue(new Organization());
      await organizationsService.update(1, {
        name: 'name',
        description: 'description',
      });
      expect(spyUpdate.mock.calls[0][0]).toBe(1);
      expect(spyUpdate.mock.calls[0][1]).toEqual({
        name: 'name',
        description: 'description',
      });
    });

    it('should throw NotFoundException when organization does not exists', () => {
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue(undefined);
      expect(
        organizationsService.update(1, {
          name: 'name',
          description: 'description',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should call softDelete of repository', async () => {
      jest
        .spyOn(mockRepository, 'findOne')
        .mockResolvedValue(new Organization());
      const spy = jest.spyOn(mockRepository, 'softDelete');
      await organizationsService.softDelete(1);
      expect(spy.mock.calls[0][0]).toBe(1);
    });

    it('should throw NotFoundException when organization does not exists', () => {
      jest.spyOn(mockRepository, 'findOne').mockResolvedValue(undefined);
      expect(organizationsService.softDelete(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
