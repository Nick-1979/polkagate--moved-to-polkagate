// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Divider, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import settings from '@polkadot/ui-settings';

import { connect, connectB, key, keyB, restore, restoreB, sitemap, sitemapB } from '../assets/icons';
import { ActionContext, MenuItem } from '../components';
import { useTranslation } from '../hooks';
import { windowOpen } from '../messaging';


interface Props {
  toggleSettingSubMenu: () => void
}

function ImportAccSubMenu({ toggleSettingSubMenu }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const _goToRestoreFromJson = useCallback(
    (): void => {
      windowOpen('/account/restore-json').catch(console.error);
    }, []
  );

  const _goToImportAcc = useCallback(
    () => {
      onAction('/account/import-seed');
    }, [onAction]
  );

  const _goToAddProxied = useCallback(
    () => {
      onAction('/account/proxy');
    }, [onAction]
  );

  const _goToAttachQR = useCallback(
    () => {
      onAction('/account/attach-qr');
    }, [onAction]
  );

  const _goToImportLedger = useCallback(
    (): void => {
      windowOpen('/account/import-ledger').catch(console.error);
    }, []
  );

  const QrIcon = (
    <vaadin-icon
      icon='vaadin:qrcode'
      style={{
        height: '18px',
        width: '18px',
        color: `${settings.camera === 'on'
          ? theme.palette.mode === 'dark' ? 'white' : 'black'
          : 'theme.palette.text.disabled'}`
      }}
    />
  );

  return (
    <>
      <Divider sx={{ bgcolor: 'secondary.light', height: '1px' }} />
      <Grid
        container
        direction='column'
        sx={{ p: '18px 0 15px 10px' }}
      >
        <MenuItem
          icon={theme.palette.mode === 'light' ? restoreB : restore}
          onClick={_goToRestoreFromJson}
          py='4px'
          text={t('Restore from JSON file')}
        />
        <MenuItem
          icon={theme.palette.mode === 'light' ? keyB : key}
          onClick={_goToImportAcc}
          py='4px'
          text={t('Import from mnemonic')}
        // onClick={}
        />
        <MenuItem
          disabled={settings.camera !== 'on'}
          onClick={_goToAttachQR}
          py='4px'
          text='Attach external QR-signer '
          iconComponent={QrIcon}
        />
        {settings.camera !== 'on' &&
          <Grid fontSize='10px' item letterSpacing='-1.5%' onClick={toggleSettingSubMenu} textAlign='left' sx={{ cursor: 'pointer' }}>
            Allow QR camera access in the extension’s setting in order to use this feature
            <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 10, mb: '-2px', stroke: '#BA2882' }} />

          </Grid>
        }
        <MenuItem
          icon={theme.palette.mode === 'light' ? connectB : connect}
          onClick={_goToImportLedger}
          py='4px'
          text='Attach ledger device'
        />
        <MenuItem
          icon={theme.palette.mode === 'light' ? sitemapB : sitemap}
          onClick={_goToAddProxied}
          py='4px'
          text='Add address only'
        />
      </Grid>
    </>
  );
}

export default React.memo(ImportAccSubMenu);
