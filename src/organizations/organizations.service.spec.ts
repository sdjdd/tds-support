import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMockRepository, MockRepository } from '@/common/mocks';
import { Organization } from './entities/organization.entity';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  let organizationsRepository: MockRepository;
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
      await organizationsService.create({
        name: 'org-name',
        description: 'org-desc',
      });
      expect(organizationsRepository.insert).toBeCalledWith({
        name: 'org-name',
        description: 'org-desc',
      });
    });

    it('should set default values', async () => {
      await organizationsService.create({
        name: 'org-name',
      });
      expect(organizationsRepository.insert).toBeCalledWith({
        name: 'org-name',
        description: '',
      });
    });
  });

  describe('find', () => {
    it('should find organizations', async () => {
      await organizationsService.find();
      expect(organizationsRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOrFail', () => {
    it('should throw NotFoundException when organization not exists', async () => {
      organizationsRepository.findOne.mockResolvedValue(undefined);
      await expect(organizationsService.findOneOrFail(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update organization', async () => {
      organizationsRepository.findOne.mockResolvedValue(new Organization());
      await organizationsService.update(1, {
        name: 'new-org-name',
        description: 'new-org-desc',
      });
      expect(organizationsRepository.update).toBeCalledWith(1, {
        name: 'new-org-name',
        description: 'new-org-desc',
      });
    });

    it('should throw NotFoundException organization not exists', async () => {
      organizationsRepository.findOne.mockResolvedValue(undefined);
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
      organizationsRepository.findOne.mockResolvedValue(new Organization());
      await organizationsService.softDelete(1);
      expect(organizationsRepository.softDelete).toBeCalledWith(1);
    });

    it('should throw NotFoundException when organization not exists', async () => {
      organizationsRepository.findOne.mockResolvedValue(undefined);
      await expect(organizationsService.softDelete(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
