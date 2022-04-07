import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationService } from './organization.service';

describe('OrganizationsService', () => {
  let organizationRepository: Repository<Organization>;
  let organizationService: OrganizationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            insert: jest.fn(),
            softDelete: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    organizationRepository = module.get(getRepositoryToken(Organization));
    organizationService = module.get(OrganizationService);
  });

  describe('create', () => {
    it('should insert organization', async () => {
      await organizationService.create({
        name: 'org-name',
        description: 'org-desc',
        subdomain: 'support',
      });
      expect(organizationRepository.insert).toBeCalledWith({
        name: 'org-name',
        description: 'org-desc',
        subdomain: 'support',
      });
    });

    it('should set default values', async () => {
      await organizationService.create({
        name: 'org-name',
      });
      expect(organizationRepository.insert).toBeCalledWith({
        name: 'org-name',
        description: '',
      });
    });

    it('should throw when subdomain already exists', async () => {
      jest
        .spyOn(organizationService, 'findOneBySubdomain')
        .mockResolvedValue(new Organization());
      await expect(
        organizationService.create({
          name: 'org-name',
          description: 'org-desc',
          subdomain: 'support',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('find', () => {
    it('should find organizations', async () => {
      await organizationService.find();
      expect(organizationRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOrFail', () => {
    it('should throw when organization not exists', async () => {
      await expect(organizationService.findOneOrFail(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update organization', async () => {
      jest
        .spyOn(organizationRepository, 'findOne')
        .mockResolvedValueOnce(new Organization());
      await organizationService.update(1, {
        name: 'new-org-name',
        description: 'new-org-desc',
        subdomain: 'new-subdomain',
      });
      expect(organizationRepository.update).toBeCalledWith(1, {
        name: 'new-org-name',
        description: 'new-org-desc',
        subdomain: 'new-subdomain',
      });
    });

    it('should throw when organization not exists', async () => {
      await expect(
        organizationService.update(1, {
          name: 'new-org-name',
          description: 'new-org-desc',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when subdomain already exists', async () => {
      jest
        .spyOn(organizationRepository, 'findOne')
        .mockResolvedValueOnce(new Organization());
      jest
        .spyOn(organizationService, 'findOneBySubdomain')
        .mockResolvedValue(new Organization());
      await expect(
        organizationService.update(1, {
          subdomain: 'some-subdomain',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should not throw when subdoman not changed', async () => {
      const organization = new Organization();
      organization.subdomain = 'some-subdomain';
      jest
        .spyOn(organizationRepository, 'findOne')
        .mockResolvedValueOnce(organization);
      jest
        .spyOn(organizationService, 'findOneBySubdomain')
        .mockResolvedValue(new Organization());
      await expect(
        organizationService.update(1, {
          subdomain: 'some-subdomain',
        }),
      ).resolves.not.toThrowError();
    });
  });

  describe('softDelete', () => {
    it('should soft delete organization', async () => {
      jest
        .spyOn(organizationRepository, 'findOne')
        .mockResolvedValueOnce(new Organization());
      await organizationService.softDelete(1);
      expect(organizationRepository.softDelete).toBeCalledWith(1);
    });

    it('should throw when organization not exists', async () => {
      await expect(organizationService.softDelete(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
