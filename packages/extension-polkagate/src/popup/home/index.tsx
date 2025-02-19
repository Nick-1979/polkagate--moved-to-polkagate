// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AccountContext } from '../../components';
import { useChainNames, useMerkleScience, usePrices, useTranslation } from '../../hooks';
import { tieAccount } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';
import { NEW_VERSION_ALERT, TEST_NETS } from '../../util/constants';
import AddAccount from '../welcome/AddAccount';
import AccountsTree from './AccountsTree';
import Alert from './Alert';
import YouHave from './YouHave';

export default function Home(): React.ReactElement {
  const { t } = useTranslation();
  const { accounts, hierarchy } = useContext(AccountContext);
  const chainNames = useChainNames();

  usePrices(chainNames); // get balances for all chains available in accounts
  useMerkleScience(undefined, undefined, true);  // to download the data file

  const [sortedAccount, setSortedAccount] = useState<AccountWithChildren[]>([]);
  const [hideNumbers, setHideNumbers] = useState<boolean>();
  const [show, setShowAlert] = useState<boolean>(false);
  const [quickActionOpen, setQuickActionOpen] = useState<string | boolean>();

  useEffect(() => {
    const isTestnetDisabled = window.localStorage.getItem('testnet_enabled') !== 'true';

    isTestnetDisabled && (
      accounts?.forEach(({ address, genesisHash }) => {
        if (genesisHash && TEST_NETS.includes(genesisHash)) {
          tieAccount(address, null).catch(console.error);
        }
      })
    );
  }, [accounts]);

  useEffect(() => {
    const value = window.localStorage.getItem(NEW_VERSION_ALERT);

    if (!value || (value && value !== 'ok')) {
      setShowAlert(true);
    }
  }, []);

  useEffect(() => {
    cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);
  }, []);

  useEffect(() => {
    setSortedAccount(hierarchy.sort((a, b) => {
      const x = a.name.toLowerCase();
      const y = b.name.toLowerCase();

      if (x < y) {
        return -1;
      }

      if (x > y) {
        return 1;
      }

      return 0;
    }));
  }, [hierarchy]);

  return (
    <>
      <Alert
        setShowAlert={setShowAlert}
        show={show}
      />
      {(hierarchy.length === 0)
        ? <AddAccount />
        : (
          <>
            <Grid padding='0px' textAlign='center' xs={12}>
              <HeaderBrand
                showBrand
                showMenu
                text={t<string>('Polkagate')}
              />
            </Grid>
            <YouHave
              hideNumbers={hideNumbers}
              setHideNumbers={setHideNumbers}
            />
            <Container
              disableGutters
              sx={[{
                m: 'auto',
                maxHeight: `${self.innerHeight - 165}px`,
                mt: '10px',
                overflowY: 'scroll',
                p: 0,
                width: '92%'
              }]}
            >
              {sortedAccount.map((json, index): React.ReactNode => (
                <AccountsTree
                  {...json}
                  hideNumbers={hideNumbers}
                  key={`${index}:${json.address}`}
                  quickActionOpen={quickActionOpen}
                  setQuickActionOpen={setQuickActionOpen}
                />
              ))}
            </Container>
          </>
        )
      }
    </>
  );
}
