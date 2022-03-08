import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMockRepository } from '@/common/mocks';
import { Organization } from './entities/organization.entity';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  let organizationsRepository: Repository<Organization>;
  let organizationsService: OrganizationsService;

  beforeEach(async () => {
    organizationsRepository = createMockRepository();

    const module = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getRepositoryToken(Organization),
          useValue: organizationsRepository,
        },
      ],
    }).compile();

    organizationsService = module.get(OrganizationsService);
  });

  describe('create', () => {
    it('should insert organization', async () => {
      const spy = jest.spyOn(organizationsRepository, 'insert');
      await organizationsService.create({
        name: 'org-name',
        description: 'org-desc',
      });
      expect(spy.mock.calls[0][0]).toEqual({
        name: 'org-name',
        description: 'org-desc',
      });
    });

    it('should set default values', async () => {
      const spy = jest.spyOn(organizationsRepository, 'insert');
      await organizationsService.create({
        name: 'org-name',
      });
      expect(spy.mock.calls[0][0]).toEqual({
        name: 'org-name',
        description: '',
      });
    });
  });

  describe('find', () => {
    it('should find organizations', async () => {
      const spy = jest.spyOn(organizationsRepository, 'find');
      await organizationsService.find();
      expect(spy.mock.calls.length).toBe(1);
    });
  });

  describe('findOrFail', () => {
    it('should throw NotFoundException when organization not exists', async () => {
      jest
        .spyOn(organizationsRepository, 'findOne')
        .mockResolvedValue(undefined);
      await expect(organizationsService.findOneOrFail(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update organization', async () => {
      const spy = jest.spyOn(organizationsRepository, 'update');
      jest
        .spyOn(organizationsRepository, 'findOne')
        .mockResolvedValue(new Organization());
      await organizationsService.update(1, {
        name: 'new-org-name',
        description: 'new-org-desc',
      });
      expect(spy.mock.calls[0][0]).toBe(1);
      expect(spy.mock.calls[0][1]).toEqual({
        name: 'new-org-name',
        description: 'new-org-desc',
      });
    });

    it('should throw NotFoundException organization not exists', async () => {
      jest
        .spyOn(organizationsRepository, 'findOne')
        .mockResolvedValue(undefined);
      await expect(
        organizationsService.update(1, {
          name: 'new-org-name',
          description: 'new-org-desc',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should soft delete organization', async () => {
      jest
        .spyOn(organizationsRepository, 'findOne')
        .mockResolvedValue(new Organization());
      const spy = jest.spyOn(organizationsRepository, 'softDelete');
      await organizationsService.softDelete(1);
      expect(spy.mock.calls[0][0]).toBe(1);
    });

    it('should throw NotFoundException when organization not exists', async () => {
      jest
        .spyOn(organizationsRepository, 'findOne')
        .mockResolvedValue(undefined);
      await expect(organizationsService.softDelete(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
