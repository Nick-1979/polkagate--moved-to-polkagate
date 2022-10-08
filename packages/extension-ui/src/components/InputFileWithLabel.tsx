// Copyright 2017-2022 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import { Box, Grid, Typography } from '@mui/material';
import React, { createRef, useCallback, useState } from 'react';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import styled from 'styled-components';

import { formatNumber, hexToU8a, isHex, u8aToString } from '@polkadot/util';

import PButton from '../../../extension-polkagate/src/components/PButton';
import useTranslation from '../hooks/useTranslation';

function classes(...classNames: (boolean | null | string | undefined)[]): string {
  return classNames
    .filter((className): boolean => !!className)
    .join(' ');
}

export interface InputFileProps {
  // Reference Example Usage: https://github.com/react-dropzone/react-dropzone/tree/master/examples/Accept
  // i.e. MIME types: 'application/json, text/plain', or '.json, .txt'
  className?: string;
  accept?: string;
  clearContent?: boolean;
  convertHex?: boolean;
  help?: React.ReactNode;
  isDisabled?: boolean;
  isError?: boolean;
  label: string;
  onChange?: (contents: Uint8Array, name: string) => void;
  placeholder?: React.ReactNode | null;
  withEllipsis?: boolean;
  withLabel?: boolean;
}

interface FileState {
  name: string;
  size: number;
}

const BYTE_STR_0 = '0'.charCodeAt(0);
const BYTE_STR_X = 'x'.charCodeAt(0);
const NOOP = (): void => undefined;

function convertResult(result: ArrayBuffer, convertHex?: boolean): Uint8Array {
  const data = new Uint8Array(result);

  // this converts the input (if detected as hex), vai the hex conversion route
  if (convertHex && data[0] === BYTE_STR_0 && data[1] === BYTE_STR_X) {
    const hex = u8aToString(data);

    if (isHex(hex)) {
      return hexToU8a(hex);
    }
  }

  return data;
}

function InputFile({ accept, className = '', clearContent, convertHex, isDisabled, isError = false, label, onChange, placeholder }: InputFileProps): React.ReactElement<InputFileProps> {
  const { t } = useTranslation();
  const dropRef = createRef<DropzoneRef>();
  const [file, setFile] = useState<FileState | undefined>();

  const _onDrop = useCallback(
    (files: File[]): void => {
      files.forEach((file): void => {
        const reader = new FileReader();

        reader.onabort = NOOP;
        reader.onerror = NOOP;

        reader.onload = ({ target }: ProgressEvent<FileReader>): void => {
          if (target && target.result) {
            const name = file.name;
            const data = convertResult(target.result as ArrayBuffer, convertHex);

            onChange && onChange(data, name);
            dropRef && setFile({
              name,
              size: data.length
            });
          }
        };

        reader.readAsArrayBuffer(file);
      });
    },
    [convertHex, dropRef, onChange]
  );

  const dropZone = (
    <Dropzone
      accept={accept}
      disabled={isDisabled}
      multiple={false}
      onDrop={_onDrop}
      ref={dropRef}
    >
      {({ getInputProps, getRootProps }): JSX.Element => (
        <Box
          border='1px dashed'
          borderColor='secondary.light'
          borderRadius='5px'
          boxSizing='border-box'
          height='200px'
          m='10px 15px'
          sx={{ backgroundColor: 'background.paper' }}
        >
          <div {...getRootProps({ className: classes('ui--InputFile', isError ? 'error' : '', className) })}>
            <Grid container justifyContent='center' direction='column' alignItems='center'>
              <Grid item sx={{ width: '60%' }}>
                <PButton
                  // _onClick={_onRestore}
                  // isBusy={isBusy}
                  _mt='21px'
                  _variant='outlined'
                  // disabled={isFileError || isPasswordError}
                  text={t<string>('Browse file')}
                />
              </Grid>
              <Grid item mt='11px'>
                {t('Or')}
              </Grid>
              <input {...getInputProps()} />
              <Grid item mt='20px'>
                {
                  !file || clearContent
                    ? placeholder || t('drag and drop the file here')
                    : placeholder || t('{{name}} ({{size}} bytes)', {
                      replace: {
                        name: file.name,
                        size: formatNumber(file.size)
                      }
                    })
                }
              </Grid>
            </Grid>
          </div>
        </Box>
      )}
    </Dropzone>
  );

  return label
    ? (
      <>
        <Typography
          fontSize='14px'
          pt='20px'
          textAlign='center'
        >
          {label}
        </Typography>
        {dropZone}
      </>
    )
    : dropZone;
}

export default React.memo(styled(InputFile)(({ isError, theme }: InputFileProps & ThemeProps) => `
  border: 1px solid ${isError ? theme.errorBorderColor : theme.inputBorderColor};
  background: ${theme.inputBackground};
  border-radius: ${theme.borderRadius};
  color: ${isError ? theme.errorBorderColor : theme.textColor};
  font-size: 1rem;
  margin: 0.25rem 0;
  overflow-wrap: anywhere;
  // padding: 10rem 0.75rem;

  &:hover {
    cursor: pointer;
  }
`));
