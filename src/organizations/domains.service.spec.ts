import { createMockRepository, MockRepository } from '@/common/mocks';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Domain } from './entities/domain.entity';
import { OrganizationsService } from './organizations.service';
import { DomainsService } from './domains.service';

describe('DomainsService', () => {
  let domainsService: DomainsService;
  let domainsRepository: MockRepository;
  let organizationsRepository: MockRepository;

  beforeEach(async () => {
    domainsRepository = createMockRepository();
    organizationsRepository = createMockRepository();

    const module = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        DomainsService,
        {
          provide: getRepositoryToken(Domain),
          useValue: domainsRepository,
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: organizationsRepository,
        },
      ],
    }).compile();

    domainsService = module.get(DomainsService);
  });

  describe('findOneByDomain', () => {
    it('should find by domain', async () => {
      await domainsService.findOneByDomain('some-domain');
      expect(domainsRepository.findOne).toBeCalledWith({
        domain: 'some-domain',
      });
    });
  });

  describe('create', () => {
    it('should insert domain', async () => {
      organizationsRepository.findOne.mockResolvedValue(new Organization());
      domainsRepository.findOne.mockResolvedValue(undefined);
      const entity = await domainsService.create(1, {
        domain: 'some-domain',
      });
      expect(entity).toBeInstanceOf(Domain);
      expect(domainsRepository.insert).toBeCalledWith({
        organizationId: 1,
        domain: 'some-domain',
      });
    });

    it('should throw when domain already exists', async () => {
      organizationsRepository.findOne.mockResolvedValue(new Organization());
      domainsRepository.findOne.mockResolvedValue(new Domain());
      await expect(
        domainsService.create(1, {
          domain: 'some-domain',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('find', () => {
    it('should find domains for organization', async () => {
      organizationsRepository.findOne.mockResolvedValue(new Organization());
      await domainsService.find(1);
      expect(domainsRepository.find).toBeCalledWith({ organizationId: 1 });
    });

    it('should throw NotFoundException when organization not exists', async () => {
      organizationsRepository.findOne.mockResolvedValue(undefined);
      await expect(domainsService.find(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete domain', async () => {
      organizationsRepository.findOne.mockResolvedValue(new Organization());
      domainsRepository.findOne.mockResolvedValue(new Domain());
      await domainsService.delete(1, 1);
      expect(domainsRepository.delete).toBeCalledWith({
        organizationId: 1,
        id: 1,
      });
    });

    it('should throw when domain not exists', async () => {
      organizationsRepository.findOne.mockResolvedValue(new Organization());
      await expect(domainsService.delete(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
