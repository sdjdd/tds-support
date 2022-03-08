import { createMockRepository, MockRepository } from '@/common/mocks';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Subdomain } from './entities/subdomain.entity';
import { OrganizationsService } from './organizations.service';
import { SubdomainsService } from './subdomains.service';

describe('SubdomainsService', () => {
  let subdomainsService: SubdomainsService;
  let subdomainsRepository: MockRepository;
  let organizationsRepository: MockRepository;

  beforeEach(async () => {
    subdomainsRepository = createMockRepository();
    organizationsRepository = createMockRepository();

    const module = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        SubdomainsService,
        {
          provide: getRepositoryToken(Subdomain),
          useValue: subdomainsRepository,
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: organizationsRepository,
        },
      ],
    }).compile();

    subdomainsService = module.get(SubdomainsService);
  });

  describe('findOneBySubdomain', () => {
    it('should find by subdomain', async () => {
      await subdomainsService.findOneBySubdomain('some-subdomain');
      expect(subdomainsRepository.findOne).toBeCalledWith({
        subdomain: 'some-subdomain',
      });
    });
  });

  describe('create', () => {
    it('should insert subdomain', async () => {
      organizationsRepository.findOne.mockResolvedValue(new Organization());
      subdomainsRepository.findOne.mockResolvedValue(undefined);
      const entity = await subdomainsService.create(1, {
        subdomain: 'some-subdomain',
      });
      expect(entity).toBeInstanceOf(Subdomain);
      expect(subdomainsRepository.insert).toBeCalledWith({
        organizationId: 1,
        subdomain: 'some-subdomain',
      });
    });

    it('should throw when subdomain already exists', async () => {
      organizationsRepository.findOne.mockResolvedValue(new Organization());
      subdomainsRepository.findOne.mockResolvedValue(new Subdomain());
      await expect(
        subdomainsService.create(1, {
          subdomain: 'some-subdomain',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('find', () => {
    it('should find subdomains for organization', async () => {
      organizationsRepository.findOne.mockResolvedValue(new Organization());
      await subdomainsService.find(1);
      expect(subdomainsRepository.find).toBeCalledWith({ organizationId: 1 });
    });

    it('should throw NotFoundException when organization not exists', async () => {
      organizationsRepository.findOne.mockResolvedValue(undefined);
      await expect(subdomainsService.find(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete subdomain', async () => {
      organizationsRepository.findOne.mockResolvedValue(new Organization());
      subdomainsRepository.findOne.mockResolvedValue(new Subdomain());
      await subdomainsService.delete(1, 1);
      expect(subdomainsRepository.delete).toBeCalledWith({
        organizationId: 1,
        id: 1,
      });
    });

    it('should throw when subdomain not exists', async () => {
      organizationsRepository.findOne.mockResolvedValue(new Organization());
      await expect(subdomainsService.delete(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
