import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain } from './entities/domain.entity';
import { OrganizationsService } from './organizations.service';
import { DomainsService } from './domains.service';

describe('DomainsService', () => {
  let domainsService: DomainsService;
  let domainsRepository: Repository<Domain>;
  let organizationsService: OrganizationsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        DomainsService,
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

    domainsService = module.get(DomainsService);
    domainsRepository = module.get(getRepositoryToken(Domain));
    organizationsService = module.get(OrganizationsService);
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
      jest.spyOn(domainsRepository, 'findOne').mockResolvedValue(undefined);
      await domainsService.create(1, {
        domain: 'some-domain',
      });
      expect(domainsRepository.insert).toBeCalledWith({
        orgId: 1,
        domain: 'some-domain',
      });
    });

    it('should throw when domain already exists', async () => {
      jest.spyOn(domainsRepository, 'findOne').mockResolvedValue(new Domain());
      await expect(
        domainsService.create(1, {
          domain: 'some-domain',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('find', () => {
    it('should find domains for organization', async () => {
      await domainsService.find(1);
      expect(domainsRepository.find).toBeCalledWith({ orgId: 1 });
    });

    it('should throw NotFoundException when organization not exists', async () => {
      jest
        .spyOn(organizationsService, 'findOneOrFail')
        .mockRejectedValue(new NotFoundException());
      await expect(domainsService.find(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete domain', async () => {
      jest.spyOn(domainsRepository, 'findOne').mockResolvedValue(new Domain());
      await domainsService.delete(1, 1);
      expect(domainsRepository.delete).toBeCalledWith({
        orgId: 1,
        id: 1,
      });
    });

    it('should throw when domain not exists', async () => {
      await expect(domainsService.delete(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
