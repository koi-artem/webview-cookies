import React, {useEffect} from 'react';
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

const SITE_URL = 'https://ru.bina.az';
const COOKIE_URL = 'https://ru.bina.az';
// const SITE_URL = 'https://google.com';

const COOKIE_KEY = 'binaCookies';

function App(): Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    const setCookies = async () => {
      await CookieManager.clearAll();
      const savedCookies = await AsyncStorage.getItem(COOKIE_KEY);

      if (!savedCookies) {
        return;
      }

      const parsedCookies: Cookie[] = JSON.parse(savedCookies);

      for (let cookieItem of parsedCookies) {
        const result = await CookieManager.set(SITE_URL, {
          name: cookieItem.name,
          value: cookieItem.value,
          path: cookieItem.path || '/',
          expires: cookieItem.expires,
          version: '1',
          httpOnly: true,
          secure: true,
        });

        console.log('Set cookie:', cookieItem.name, cookieItem.value, result);
        await CookieManager.set(SITE_URL, cookieItem, true);
      }
    };

    const startWatchCookiesInterval = () => {
      return setInterval(async () => {
        const cookies = await CookieManager.get(COOKIE_URL, true);

        const sessionCookie = cookies._binaaz_session;
        if (sessionCookie) {
          console.log('_binaaz_session', sessionCookie.value);
        }

        if (Object.keys(cookies).length === 0) {
          return;
        }

        const arrayOfCookies = Object.values(cookies);
        await AsyncStorage.setItem(COOKIE_KEY, JSON.stringify(arrayOfCookies));
      }, 2000);
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
