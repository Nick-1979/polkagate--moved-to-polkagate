// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeypairType } from '@polkadot/util-crypto/types';
import type { AccountInfo } from '.';

import { ArrowBackIos as ArrowBackIosIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { Warning } from '@polkadot/extension-ui/components';
import { getMetadata, validateSeed } from '@polkadot/extension-ui/messaging';
import { objectSpread } from '@polkadot/util';

import useGenesisHashOptions from '../../hooks/useGenesisHashOptions';
import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import DropdownWithIcon from '../../components/DropdownWithIcon';
import InputWithLabel from '../../components/InputWithLabel';
import PButton from '../../components/PButton';
import TextAreaWithLabel from '../../components/TextAreaWithLabel';
import getLogo from '../../util/getLogo';

interface Props {
  className?: string;
  onNextStep: () => void;
  onAccountChange: (account: AccountInfo | null) => void;
  type: KeypairType;
}

export default function SeedAndPath({ className, onAccountChange, onNextStep, type }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const genesisOptions = useGenesisHashOptions();
  const [address, setAddress] = useState('');
  const [seed, setSeed] = useState<string | null>(null);
  const [path, setPath] = useState<string | null>(null);
  const [advanced, setAdvances] = useState(false);
  const [error, setError] = useState('');
  const [genesis, setGenesis] = useState('');
  const [newChain, setNewChain] = useState<Chain | null>(null);

  useEffect(() => {
    // No need to validate an empty seed
    // we have a dedicated error for this
    if (!seed) {
      onAccountChange(null);

      return;
    }

    const suri = `${seed || ''}${path || ''}`;

    validateSeed(suri, type)
      .then((validatedAccount) => {
        setError('');
        setAddress(validatedAccount.address);
        onAccountChange(
          objectSpread<AccountInfo>({}, validatedAccount, { genesis, type })
        );
      })
      .catch(() => {
        setAddress('');
        onAccountChange(null);
        setError(path
          ? t<string>('Invalid mnemonic seed or derivation path')
          : t<string>('Invalid mnemonic seed')
        );
      });
  }, [t, genesis, seed, path, onAccountChange, type]);

  useEffect(() => {
    genesis && getMetadata(genesis, true).then(setNewChain).catch((error): void => {
      console.error(error);
      setNewChain(null);
    });
  }, [genesis]);

  const _onToggleAdvanced = useCallback(() => {
    setAdvances(!advanced);
  }, [advanced]);

  const _onChangeNetwork = useCallback(
    (newGenesisHash: string) => setGenesis(newGenesisHash),
    []
  );

  return (
    <>
      <div style={{ margin: 'auto', width: '92%' }}>
        <TextAreaWithLabel
          isError={!!error}
          isFocused
          label={t<string>('existing 12 or 24-word mnemonic seed')}
          onChange={setSeed}
          rowsCount={2}
          value={seed || ''}
        />
        {!!error && !!seed && (
          <Warning
            className='seedError'
            isBelowInput
            isDanger
          >
            {error}
          </Warning>
        )}
        <DropdownWithIcon
          defaultValue={genesisOptions[0].text}
          icon={getLogo(newChain ?? undefined)}
          label={t<string>('Select the chain')}
          onChange={_onChangeNetwork}
          options={genesisOptions}
          style={{ marginTop: '20px', p: 0 }}
        />
        <Grid
          container
          onClick={_onToggleAdvanced}
          pb='10px'
          pt='25px'
          sx={{ cursor: 'pointer' }}
        >
          <Grid
            alignItems='center'
            container
            item
            pr='10px'
            xs={1}
          >
            <ArrowBackIosIcon
              sx={{
                color: 'secondary.light',
                fontSize: 20,
                stroke: theme.palette.secondary.light,
                strokeWidth: 1.5,
                transform: advanced ? 'rotate(-0.25turn) translate(5px, 5px)' : 'rotate(-180deg)'
              }}
            />
          </Grid>
          <Grid
            item
          >
            <Typography
              fontSize='14px'
              fontWeight={300}
            >
              {t<string>('Advanced')}
            </Typography>
          </Grid>
        </Grid>
        {advanced && (
          <InputWithLabel
            isError={!!path && !!error}
            label={t<string>('Derivation path')}
            onChange={setPath}
            value={path || ''}

          />
        )}
      </div>
      <PButton
        _onClick={onNextStep}
        disabled={!address || !!error}
        text={t<string>('Next')}
      />
    </>
  );
}
