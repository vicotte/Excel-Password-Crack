import { useRef, useState } from 'react';
import './App.css';

import {
  readBinaryFile,
  writeBinaryFile,
  writeTextFile,
} from '@tauri-apps/api/fs';
import { message } from '@tauri-apps/api/dialog';
// import { invoke } from '@tauri-apps/api/tauri'
import { resolveResource } from '@tauri-apps/api/path';
import { appCacheDir } from '@tauri-apps/api/path';
import { Command } from '@tauri-apps/api/shell';
import { open } from '@tauri-apps/api/dialog';
import JSZip from 'jszip';

import { Button } from '@/components/ui/button';
import { CheckboxWic } from '@/components/ui/checkboxWic';
import { ThemeProvider } from './components/provider/theme-provider';
import { Alert } from './components/Alert';

function App() {
  const isVbaChecked = useRef(false);
  const isWsChecked = useRef(false);

  const [alertIsShown, setAlertIsShown] = useState(false);

  function handleCheckboxChange(payload: { isChecked: boolean; name: string }) {
    if (payload.name === 'vba') isVbaChecked.current = payload.isChecked;
    if (payload.name === 'ws') isWsChecked.current = payload.isChecked;
  }

  async function openFolderDialog() {
    console.log(isWsChecked.current);
    console.log(isVbaChecked.current);
    if (!isVbaChecked.current && !isWsChecked.current) {
      await message('Select at least one option', {
        title: 'Error',
        type: 'error',
      });
    } else {
      try {
        const excelFile = await open({
          multiple: false,
          defaultPath: '/',
          filters: [
            {
              name: '',
              extensions: ['xlsx', 'xlsm'],
            },
          ],
        });

        if (typeof excelFile === 'string') {
          //create a const excelExtension that keep the 4 last char of  excelFIle
          const excelExtension = excelFile.slice(-4);

          const zipfile = await readBinaryFile(excelFile);
          const hackedFile =
            excelFile.slice(0, -5) + '-UNPROTECTED.' + excelExtension;
          var zip = new JSZip();

          const contents: JSZip = await zip.loadAsync(zipfile);
          // Collect promises
          const promises: Promise<void>[] = [];

          contents.forEach((_path, file) => {
            const promise = (async () => {
              if (
                isWsChecked.current &&
                ((file.name.startsWith('xl/worksheets/sheet') &&
                  file.name.endsWith('.xml')) ||
                  file.name === 'xl/workbook.xml')
              ) {
                const content = await zip.file(file.name)?.async('text');
                if (content) {
                  const parser = new DOMParser();
                  const xmlDoc = parser.parseFromString(content, 'text/xml');

                  // Find the sheetProtection element
                  const balise: string =
                    file.name === 'xl/workbook.xml'
                      ? 'workbookProtection'
                      : 'sheetProtection';
                  const sheetProtectionElement = xmlDoc.querySelector(balise);

                  // Remove the sheetProtection element if it exists
                  if (
                    sheetProtectionElement &&
                    sheetProtectionElement.parentNode
                  ) {
                    sheetProtectionElement.parentNode.removeChild(
                      sheetProtectionElement,
                    );
                  }
                  // Serialize the modified document back to XML
                  const modifiedXmlString =
                    new XMLSerializer().serializeToString(xmlDoc);
                  zip.file(file.name, modifiedXmlString);
                }
              }
              // Debut crack VBA
              if (isVbaChecked.current && file.name === 'xl/vbaProject.bin') {
                console.log("c'est passé");
                const byteArray = await zip
                  .file(file.name)
                  ?.async('uint8array');

                if (byteArray !== undefined) {
                  // ASCII codes
                  const DPT = [68, 80, 66];
                  const DPX = [68, 80, 120];
                  if (byteArray) {
                    for (
                      let i = 0;
                      i < byteArray.length - DPT.length + 1;
                      i++
                    ) {
                      let match = true;
                      for (let j = 0; j < DPT.length; j++) {
                        if (byteArray[i + j] !== DPT[j]) {
                          match = false;
                          break;
                        }
                      }

                      if (match) {
                        // Replace "DPT" with "DPX"
                        for (let j = 0; j < DPX.length; j++) {
                          byteArray[i + j] = DPX[j];
                        }
                      }
                    }
                  }
                  zip.file(file.name, byteArray);
                }
              }
            })();

            promises.push(promise);
          });

          await Promise.all(promises);

          const zipContent = await zip.generateAsync({
            type: 'uint8array',
          });

          await writeBinaryFile(hackedFile, zipContent);
          // await message(
          //   'You can find the unprotected version of the excel in the same folder as the original',
          //   {
          //     title: 'File Cracked',
          //     type: 'info',
          //   },
          // );
          setAlertIsShown(true);

          if (isVbaChecked.current && excelExtension === 'xlsm') {
            const localizationExeFile = await resolveResource(
              'binaries/script.EXE',
            );

            console.log(localizationExeFile.substring(4));

            const appCacheDirPath = await appCacheDir();
            const locationFilePath3 =
              appCacheDirPath + 'excelcrack-filelocation.wp';
            await writeTextFile(locationFilePath3, hackedFile);

            console.log(locationFilePath3);

            const command = Command.sidecar('binaries/script');
            const output = await command.execute();
            console.log(output);
          }
        } else {
          console.log('No file selected.');
        }
      } catch (error) {
        console.error(
          'Error opening file dialog or unzipping the file:',
          error,
        );
      }
    }
  }

  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <Alert
        isShown={alertIsShown}
        handleOkButtonClick={() => setAlertIsShown(false)}
      >
        <div className='container h-screen mx-auto flex flex-col '>
          <div className='h-16 flex justify-end items-center'>
            <div className=' mr-10 font-semibold text-lg'>Wic</div>
          </div>
          <div className='container mx-auto flex flex-col justify-center items-center grow'>
            <h1 className='text-3xl font-bold align-middle mb-10 text-gray-50'>
              Choose your Excel
            </h1>
            <CheckboxWic name='ws' handleChange={handleCheckboxChange}>
              Crack Workbook Password
            </CheckboxWic>
            <CheckboxWic name='vba' handleChange={handleCheckboxChange}>
              Crack VBA Password (Beta)
            </CheckboxWic>
            <Button
              variant='outline'
              className='mt-4'
              onClick={openFolderDialog}
            >
              Crack Excel
            </Button>
          </div>
          <div className='h-16 flex justify-end items-center'></div>
        </div>
      </Alert>
    </ThemeProvider>
  );
}

export default App;
