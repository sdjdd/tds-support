import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain } from './entities/domain.entity';
import { OrganizationsService } from './organizations.service';
import { DomainService } from './domain.service';

describe('DomainsService', () => {
  let domainService: DomainService;
  let domainRepository: Repository<Domain>;
  let organizationService: OrganizationsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        DomainService,
        {
          provide: getRepositoryToken(Domain),
          useValue: {
            delete: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            insert: jest.fn(),
          },
        },
        {
          provide: OrganizationsService,
          useValue: {
            findOneOrFail: jest.fn(),
          },
        },
      ],
    }).compile();

    domainService = module.get(DomainService);
    domainRepository = module.get(getRepositoryToken(Domain));
    organizationService = module.get(OrganizationsService);
  });

  describe('findOneByDomain', () => {
    it('should find by domain', async () => {
      await domainService.findOneByDomain('some-domain');
      expect(domainRepository.findOne).toBeCalledWith({
        domain: 'some-domain',
      });
    });
  });

  describe('create', () => {
    it('should insert domain', async () => {
      jest.spyOn(domainRepository, 'findOne').mockResolvedValue(undefined);
      await domainService.create(1, {
        domain: 'some-domain',
      });
      expect(domainRepository.insert).toBeCalledWith({
        orgId: 1,
        domain: 'some-domain',
      });
    });

    it('should throw when domain already exists', async () => {
      jest.spyOn(domainRepository, 'findOne').mockResolvedValue(new Domain());
      await expect(
        domainService.create(1, {
          domain: 'some-domain',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('find', () => {
    it('should find domains for organization', async () => {
      await domainService.find(1);
      expect(domainRepository.find).toBeCalledWith({ orgId: 1 });
    });

    it('should throw NotFoundException when organization not exists', async () => {
      jest
        .spyOn(organizationService, 'findOneOrFail')
        .mockRejectedValue(new NotFoundException());
      await expect(domainService.find(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete domain', async () => {
      jest.spyOn(domainRepository, 'findOne').mockResolvedValue(new Domain());
      await domainService.delete(1, 1);
      expect(domainRepository.delete).toBeCalledWith({
        orgId: 1,
        id: 1,
      });
    });

    it('should throw when domain not exists', async () => {
      await expect(domainService.delete(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
