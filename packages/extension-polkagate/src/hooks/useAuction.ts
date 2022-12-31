// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Auction } from '../util/types';

import { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { hexToBn, hexToString } from '@polkadot/util';

import { DEFAULT_IDENTITY } from '../util/constants';
import { useAccountInfo, useApi } from '.';

export default function useAuction(address: string): Auction | null | undefined {
  const api = useApi(address);
  const [auction, setAuction] = useState<Auction | null>();

  const getCrowdloans = useCallback(async (api: ApiPromise) => {
    console.log('getting crowdloans ...');
    const allParaIds = (await api.query.paras.paraLifecycles.entries()).map(([key, _]) => key.args[0]);

    const [auctionInfo, auctionCounter, funds, leases, header] = await Promise.all([
      api.query.auctions.auctionInfo(),
      api.query.auctions.auctionCounter(),
      api.query.crowdloan.funds.multi(allParaIds),
      api.query.slots.leases.multi(allParaIds),
      api.rpc.chain.getHeader()
    ]);

    const parsedInfo = auctionInfo.isSome ? JSON.parse(auctionInfo.toString()) : null;
    const auctionEndBlock = parsedInfo ? parsedInfo[1] : null;
    const currentBlock = Number(header?.number ?? 0);
    const blockOffset = auctionEndBlock && currentBlock ? currentBlock - auctionEndBlock + 1 : 0;

    const hasLease = [];

    leases.forEach((lease, index) => {
      if (lease.length) {
        hasLease.push(allParaIds[index].toString());
      }
    }
    );

    const fundsWithParaId = funds.map((fund, index) => {
      if (fund.toString()) {
        const jpFund = JSON.parse(fund.toString());

        jpFund.raised = hexToBn(jpFund.raised).toString();
        jpFund.cap = hexToBn(jpFund.cap).toString();
        jpFund.deposit = (jpFund.deposit).toString();
        jpFund.paraId = String(allParaIds[index]);
        jpFund.hasLeased = hasLease.includes(jpFund.paraId);

        return jpFund;
      }

      return null;
    });
    const nonEmtyFunds = fundsWithParaId.filter((fund) => fund);
    // const depositors = nonEmtyFunds.map((d) => d.depositor);

    // const identities = await getIdentities(api, depositors);
    const crowdloansWithIdentity = nonEmtyFunds.map((fund, index) => {
      return {
        fund
        // identity: identities[index]
      };
    });

    const winning = blockOffset > 1 ? await api.query.auctions.winning(blockOffset) : undefined;
    console.log('winning :', winning?.toString() ? Array.from(winning.toHuman()) : '');

    return {
      auctionCounter: Number(auctionCounter),
      auctionInfo: auctionInfo.toString() ? JSON.parse(auctionInfo.toString()) : null,
      // blockchain: _chainName,
      crowdloans: crowdloansWithIdentity,
      currentBlockNumber: Number(String(header.number)),
      minContribution: api.consts.crowdloan.minContribution.toString(),
      winning:
        // winning.toString() ? Array.from(winning.toHuman()) :
        []
    };
  }, []);

  useEffect(() => {
    console.log('api:', !!api)
    api && getCrowdloans(api).then((fetchedAuction) => {
      setAuction(fetchedAuction);
    });
  }, [api, getCrowdloans]);

  return auction;
}
