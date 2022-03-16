import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  let organizationsRepository: Repository<Organization>;
  let organizationsService: OrganizationsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrganizationsService,
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

    organizationsRepository = module.get(getRepositoryToken(Organization));
    organizationsService = module.get(OrganizationsService);
  });

  describe('create', () => {
    it('should insert organization', async () => {
      await organizationsService.create({
        name: 'org-name',
        description: 'org-desc',
        subdomain: 'support',
      });
      expect(organizationsRepository.insert).toBeCalledWith({
        name: 'org-name',
        description: 'org-desc',
        subdomain: 'support',
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

    it('should throw when subdomain already exists', async () => {
      jest
        .spyOn(organizationsService, 'findOneBySubdomain')
        .mockResolvedValue(new Organization());
      await expect(
        organizationsService.create({
          name: 'org-name',
          description: 'org-desc',
          subdomain: 'support',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('find', () => {
    it('should find organizations', async () => {
      await organizationsService.find();
      expect(organizationsRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOrFail', () => {
    it('should throw when organization not exists', async () => {
      await expect(organizationsService.findOneOrFail(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update organization', async () => {
      jest
        .spyOn(organizationsRepository, 'findOne')
        .mockResolvedValueOnce(new Organization());
      await organizationsService.update(1, {
        name: 'new-org-name',
        description: 'new-org-desc',
        subdomain: 'new-subdomain',
      });
      expect(organizationsRepository.update).toBeCalledWith(1, {
        name: 'new-org-name',
        description: 'new-org-desc',
        subdomain: 'new-subdomain',
      });
    });

    it('should throw when organization not exists', async () => {
      await expect(
        organizationsService.update(1, {
          name: 'new-org-name',
          description: 'new-org-desc',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when subdomain already exists', async () => {
      jest
        .spyOn(organizationsRepository, 'findOne')
        .mockResolvedValueOnce(new Organization());
      jest
        .spyOn(organizationsService, 'findOneBySubdomain')
        .mockResolvedValue(new Organization());
      await expect(
        organizationsService.update(1, {
          subdomain: 'some-subdomain',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should not throw when subdoman not changed', async () => {
      const organization = new Organization();
      organization.subdomain = 'some-subdomain';
      jest
        .spyOn(organizationsRepository, 'findOne')
        .mockResolvedValueOnce(organization);
      jest
        .spyOn(organizationsService, 'findOneBySubdomain')
        .mockResolvedValue(new Organization());
      await expect(
        organizationsService.update(1, {
          subdomain: 'some-subdomain',
        }),
      ).resolves.not.toThrowError();
    });
  });

  describe('softDelete', () => {
    it('should soft delete organization', async () => {
      jest
        .spyOn(organizationsRepository, 'findOne')
        .mockResolvedValueOnce(new Organization());
      await organizationsService.softDelete(1);
      expect(organizationsRepository.softDelete).toBeCalledWith(1);
    });

    it('should throw when organization not exists', async () => {
      await expect(organizationsService.softDelete(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
