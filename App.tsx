import React, {useEffect, useRef} from 'react';
import CookieManager, {Cookie} from '@react-native-cookies/cookies';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import WebView from 'react-native-webview';

const SITE_URL = 'https://bina.az';
const COOKIE_URL = 'https://ru.bina.az';
const COOKIE_KEY = 'binaCookies';

function App(): Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const counter = useRef<number>();
  counter.current = 1;

  useEffect(() => {
    const setCookies = async () => {
      await CookieManager.clearAll(true);
      const savedCookies = await AsyncStorage.getItem(COOKIE_KEY);

      if (!savedCookies) {
        return;
      }

      const parsedCookies: Cookie[] = JSON.parse(savedCookies);

      for (let cookieItem of parsedCookies) {
        const result = await CookieManager.set(
          COOKIE_URL,
          {
            name: cookieItem.name,
            domain: '.bina.az',
            value: cookieItem.value,
            path: cookieItem.path || '/',
            expires: cookieItem.expires,
            version: '1',
            httpOnly: true,
            secure: true,
          },
          true,
        );

        console.log('Set cookie:', cookieItem.name, cookieItem.value, result);
        await CookieManager.set(COOKIE_URL, cookieItem, true);
      }
    };

    const startWatchCookiesInterval = () => {
      return setInterval(async () => {
        const cookies = await CookieManager.get(COOKIE_URL, true);

        const sessionCookie = cookies._binaaz_session;
        if (sessionCookie) {
          console.log('_binaaz_session', sessionCookie.value.slice(0, 10));
        } else {
          console.log('cookies', cookies)
        }

        if (Object.keys(cookies).length === 0) {
          console.log('no cookies');
          return;
        }

        counter.current = (counter.current as any) + 1;
        const counterCookie = await CookieManager.set(
          COOKIE_URL,
          {
            name: 'counter',
            domain: '.bina.az',
            value: (counter.current as number).toString(),
            path: '/',
            expires: new Date(+new Date() + 60 * 60 * 1000).toISOString(),
            version: '1',
            httpOnly: true,
            secure: true,
          },
          true,
        );
        console.log(counterCookie, counter.current);

        const arrayOfCookies = Object.values(cookies);
        await AsyncStorage.setItem(COOKIE_KEY, JSON.stringify(arrayOfCookies));
      }, 10000);
    };

    setCookies();

    let interval: any = null;
    const timeout = setTimeout(() => {
      interval = startWatchCookiesInterval();
    }, 2000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  });

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <WebView
            key="webView"
            style={webviewStyles}
            sharedCookiesEnabled
            webviewDebuggingEnabled
            source={{
              uri: SITE_URL,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const webviewStyles: any = {width: '100%', height: 800};
export default App;
