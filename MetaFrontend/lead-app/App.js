
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { io } from 'socket.io-client';

const URL = (process.env.EXPO_PUBLIC_SERVER_URL || 'https://variably-chair-ethics.ngrok-free.dev').replace(/\/$/, '');

const theme = {
  bg: '#F1F4F6',
  card: '#FFFFFF',
  text: '#17232D',
  muted: '#5D6C78',
  green: '#0E7C66',
  border: '#DDE3E8',
  warning: '#B45309',
};

const getId = item => String(item.id ?? item.leadgenId ?? item.leadgen_id ?? item._id);

const getInfo = item => {
  const data = item.fields || {};
  const name =
    data.full_name ||
    [data.first_name, data.last_name].filter(Boolean).join(' ') ||
    'Unnamed lead';

  return {
    name,
    details: [data.email, data.phone_number || data.phone].filter(Boolean),
  };
};

const getTime = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
};

const Lead = ({ item }) => {
  const { name, details } = getInfo(item);

  return (
    <View style={[styles.card, item.isLive && styles.liveCard]}>
      <Text style={styles.name}>{name}</Text>

      {details.map((value, index) => (
        <Text key={`${value}-${index}`} style={styles.detail}>
          {value}
        </Text>
      ))}

      {item.detailsFetched === false && (
        <Text style={styles.warning}>Form answers unavailable.</Text>
      )}

      <Text style={styles.time}>
        {getTime(item.createdAt ?? item.created_time)}
      </Text>
    </View>
  );
};

export default function App() {
  const [data, setData] = useState([]);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${URL}/leads`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = await res.json();
      if (Array.isArray(result)) setData(result);
    } catch (err) {
      console.warn('Could not load leads:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const socket = io(URL, { transports: ['websocket'] });

    socket.on('connect', () => {
      setOnline(true);
      load();
    });

    socket.on('disconnect', () => setOnline(false));

    socket.on('connect_error', err => {
      console.log('Socket error:', err.message);
    });

    socket.on('new_lead', lead => {
      setData(prev =>
        prev.some(item => getId(item) === getId(lead))
          ? prev
          : [{ ...lead, isLive: true }, ...prev]
      );
    });

    return () => socket.disconnect();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Leads</Text>

        <View style={styles.status}>
          <View style={[styles.dot, { backgroundColor: online ? theme.green : theme.muted }]} />
          <Text style={styles.statusText}>
            {online ? 'Listening for new leads' : 'Reconnecting'}
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={theme.green} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={getId}
          renderItem={({ item }) => <Lead item={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              No leads yet. New submissions will appear here.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.text,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: theme.muted,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
  },
  liveCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.green,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  detail: {
    fontSize: 15,
    color: theme.text,
    marginTop: 4,
  },
  warning: {
    fontSize: 13,
    color: theme.warning,
    marginTop: 8,
  },
  time: {
    fontSize: 13,
    color: theme.muted,
    marginTop: 10,
  },
  empty: {
    fontSize: 15,
    color: theme.muted,
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 22,
  },
});
