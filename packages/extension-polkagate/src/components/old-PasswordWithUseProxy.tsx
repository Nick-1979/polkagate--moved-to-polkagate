// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, SxProps, Theme, Tooltip, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { useAccount, useMetadata, useTranslation } from '../hooks';
import SelectProxy from '../partials/SelectProxy';
import { Proxy, ProxyItem } from '../util/types';
import { Identity, Password, Warning } from '.';

interface Props {
  api: ApiPromise | undefined;
  proxiedAddress: string | undefined | null;
  defaultValue?: string | null;
  disabled?: boolean;
  isPasswordError?: boolean;
  isFocused?: boolean;
  isReadOnly?: boolean;
  label: string;
  onChange: React.Dispatch<React.SetStateAction<string | undefined>>
  onEnter?: () => void;
  placeholder?: string;
  value?: string;
  withoutMargin?: boolean;
  genesisHash: string;
  prevState?: Record<string, any>;
  proxyTypeFilter: string[];
  style?: SxProps<Theme>;
  proxies: ProxyItem[] | undefined
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
  selectedProxy: Proxy | undefined;
  setIsPasswordError: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PasswordWithUseProxy({ defaultValue, disabled, genesisHash, isFocused, isPasswordError, isReadOnly, label = '', onChange, onEnter, placeholder, prevState, proxiedAddress, proxies, proxyTypeFilter, selectedProxy, setIsPasswordError, setSelectedProxy, style, withoutMargin }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useAccount(proxiedAddress);
  const chain = useMetadata(genesisHash, true);
  const [password, setPassword] = useState<string>();
  const [showSelectProxy, setShowSelectProxy] = useState<boolean>(false);
  const needsWarning = useMemo(() => account?.isExternal && !selectedProxy, [account, selectedProxy]);

  const _onChange = useCallback(
    (pass: string): void => {
      pass.length > 3 && pass && setPassword(pass);
      pass.length > 3 && pass && setIsPasswordError && setIsPasswordError(false);
    }, [setIsPasswordError]
  );

  const goToSelectProxy = useCallback(
    (): void => {
      setShowSelectProxy(true);
    }, [setShowSelectProxy]
  );

  useEffect(() => {
    onChange(password);
  }, [password, onChange]);

  return (
    <>
      {needsWarning &&
        <Warning
          fontWeight={400}
          marginTop={15}
          theme={theme}
        >
          {t('This is an Address Only account. You must use a proxy to complete this transaction.')}
        </Warning>
      }
      <Grid container>
        <Grid alignItems='center' container sx={{ ...style }}>
          <Grid item xs={proxies?.length ? 8 : 12} >
            <Password
              defaultValue={defaultValue}
              disabled={disabled || needsWarning}
              isError={isPasswordError}
              isFocused={isFocused}
              isReadOnly={isReadOnly}
              label={label}
              onChange={_onChange}
              onEnter={onEnter}
              placeholder={placeholder}
              withoutMargin={withoutMargin}
            />
          </Grid>
          {(!!proxies?.length || prevState?.selectedProxyAddress) &&
            <Tooltip
              arrow
              componentsProps={{
                popper: {
                  sx: {
                    '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-18kejt8': {
                      mb: '3px',
                      p: '3px 15px'
                    },
                    '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-1yuxi3g': {
                      mb: '3px',
                      p: '3px 15px'
                    },
                    visibility: selectedProxy ? 'visible' : 'hidden'
                  }
                },
                tooltip: {
                  sx: {
                    '& .MuiTooltip-arrow': {
                      color: '#fff',
                      height: '10px'
                    },
                    backgroundColor: '#fff',
                    color: '#000',
                    // fontSize: copied ? '16px' : '14px',
                    fontWeight: 400
                  }
                }
              }}
              leaveDelay={300}
              placement='top-start'
              title={
                <>
                  {selectedProxy &&
                    <Identity
                      chain={chain}
                      formatted={selectedProxy?.delegate}
                      identiconSize={30}
                      style={{ fontSize: '14px' }}
                    />
                  }
                </>
              }
            >
              <Grid item onClick={goToSelectProxy} pl='10px' pt='10px' sx={{ cursor: 'pointer', fontWeight: 400, textDecorationLine: 'underline' }}              >
                {selectedProxy ? t('Update proxy') : t('Use proxy')}
              </Grid>
            </Tooltip>
          }
        </Grid>
        <SelectProxy
          genesisHash={genesisHash}
          proxiedAddress={proxiedAddress}
          proxies={proxies}
          proxyTypeFilter={proxyTypeFilter}
          selectedProxy={selectedProxy}
          setSelectedProxy={setSelectedProxy}
          setShow={setShowSelectProxy}
          show={showSelectProxy}
        />
      </Grid>
    </>
  );
}
