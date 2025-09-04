import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useTheme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import {
  allocateMonthlyBudget,
  predictEndOfMonthBalance,
  compoundInterest,
  loanMonthlyPayment,
  categoryPercentages,
} from '../utils/tools';
import { useAppSelector } from '../store';
import { formatCurrency } from '../utils/format';
import { getExpenses, getUserSettings } from '../utils/storage';
import { Dimensions } from 'react-native';
// Lưu ý: cần cài đặt react-native-chart-kit, react-native-svg
// npm i react-native-chart-kit react-native-svg
import { PieChart, LineChart } from 'react-native-chart-kit';
import * as FileSystem from 'expo-file-system';
import { expensesToCSV, csvToExpenses } from '../utils/csv';
import { saveExpenses } from '../utils/storage';
// Màu sắc cho biểu đồ
const CHART_COLORS = [
  '#FF6B6B', // Đỏ nhạt
  '#4ECDC4', // Xanh ngọc
  '#45B7D1', // Xanh dương nhạt
  '#96CEB4', // Xanh lá mạ
  '#FFEEAD', // Vàng nhạt
  '#FF9F1C', // Cam
  '#2EC4B6', // Xanh ngọc đậm
  '#E71D36', // Đỏ
  '#011627', // Xanh đen
  '#41B3A3', // Xanh ngọc nhạt
];
// Input có nhãn dùng lại nhiều nơi
const LabeledInput = ({
  label,
  value,
  onChangeText,
  keyboardType = 'numeric',
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'numeric';
  placeholder?: string;
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputRow}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[styles.input, {
          color: theme.colors.text,
          borderColor: isFocused ? theme.colors.primary : theme.colors.border,
          backgroundColor: theme.colors.card,
          borderWidth: isFocused ? 2 : 1.5,
        }]}
      />
    </View>
  );
};

// 1) Component: Ngân sách tháng
const BudgetTool = () => {
  const { theme } = useTheme();
  const [income, setIncome] = useState('15000000');
  const [savingRate, setSavingRate] = useState('0.2');

  const budget = useMemo(() => (
    allocateMonthlyBudget(Number(income) || 0,
      Number(savingRate) || 0.2)
  ), [income, savingRate]);

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Ngân sách hàng tháng
      </Text>
      <LabeledInput
        label="Thu nhập"
        value={income}
        onChangeText={setIncome}
        placeholder="VD: 15000000"
      />
      <LabeledInput
        label="Tỉ lệ tiết kiệm"
        value={savingRate}
        onChangeText={setSavingRate}
        placeholder="VD: 0.2"
      />
      <View style={[styles.card, {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border
      }]}>
        <Text style={[styles.resultText, { color: theme.colors.text }]}>
          Tiết kiệm:
        </Text>
        <Text style={[styles.resultValue, { color: theme.colors.success }]}>
          {formatCurrency(budget.saving)}
        </Text>
        <Text style={[styles.resultText, { color: theme.colors.text }]}>
          Chi tiêu:
        </Text>
        <Text style={[styles.resultValue, { color: theme.colors.primary }]}>
          {formatCurrency(budget.spending)}
        </Text>
        {Object.entries(budget.byCategory).map(([k, v]) => (
          <View key={k} style={styles.categoryItem}>
            <Text style={[styles.categoryLabel, { color: theme.colors.text }]}>
              {k}
            </Text>
            <Text style={[styles.categoryValue, { color: theme.colors.textSecondary }]}>
              {formatCurrency(v)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// 2) Component: Dự đoán số dư
const ForecastTool = () => {
  const { theme } = useTheme();
  const [balance, setBalance] = useState('0');
  const [avgSpend, setAvgSpend] = useState('0');
  const [daysLeft, setDaysLeft] = useState('0');
  const [projIncome, setProjIncome] = useState('0');

  // Tự động đề xuất giá trị từ dữ liệu thật
  useEffect(() => {
    const init = async () => {
      try {
        const [expenses, settings] = await Promise.all([
          getExpenses(),
          getUserSettings(),
        ]);
        // Trung bình chi tiêu 30 ngày gần nhất
        const now = new Date();
        const last30 = expenses.filter(e => {
          const d = new Date(e.date || e.createdAt);
          return (now.getTime() - d.getTime()) / 86400000 <= 30;
        });
        const total30 = last30.reduce((s, e) => s + (e.amount || 0), 0);
        const avg = last30.length
          ? Math.max(0, total30 / Math.max(1, last30.length))
          : 0;
        setAvgSpend(String(Math.round(avg)));

        // Ngày còn lại trong tháng hiện tại
        const cur = new Date();
        const daysInMonth = new Date(
          cur.getFullYear(), cur.getMonth() + 1, 0
        ).getDate();
        const left = daysInMonth - cur.getDate();
        setDaysLeft(String(Math.max(0, left)));

        // Dự kiến thu nhập từ cài đặt nếu có monthlyBudget
        const proj = settings.monthlyBudget || 0;
        proj && setProjIncome(String(proj));
      } catch { }
    };
    init();
  }, []);

  const projected = useMemo(() => (
    predictEndOfMonthBalance(Number(balance) || 0,
      Number(avgSpend) || 0, Number(daysLeft) || 0,
      Number(projIncome) || 0)
  ), [balance, avgSpend, daysLeft, projIncome]);

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Dự đoán số dư cuối tháng
      </Text>
      <LabeledInput
        label="Số dư hiện tại"
        value={balance}
        onChangeText={setBalance}
        placeholder="VD: 5000000"
      />
      <LabeledInput
        label="Chi TB/ngày"
        value={avgSpend}
        onChangeText={setAvgSpend}
        placeholder="VD: 200000"
      />
      <LabeledInput
        label="Ngày còn lại"
        value={daysLeft}
        onChangeText={setDaysLeft}
        placeholder="VD: 10"
      />
      <LabeledInput
        label="Thu nhập dự kiến"
        value={projIncome}
        onChangeText={setProjIncome}
        placeholder="VD: 0"
      />
      <View style={[styles.card, {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border
      }]}>
        <Text style={[styles.resultText, { color: theme.colors.text }]}>
          Số dư dự kiến:
        </Text>
        <Text style={[styles.resultValue, {
          color: projected < 0 ? theme.colors.error : theme.colors.success
        }]}>
          {formatCurrency(projected)}
        </Text>
        {projected < 0 ? (
          <Text style={[styles.warningText, { color: theme.colors.error }]}>
            ⚠ Có nguy cơ thâm hụt
          </Text>
        ) : null}
      </View>
    </View>
  );
};

// 3) Component: Lãi kép tiết kiệm
const SavingTool = () => {
  const { theme } = useTheme();
  const [principal, setPrincipal] = useState('10000000');
  const [annualRate, setAnnualRate] = useState('0.08');
  const [timesPerYear, setTimesPerYear] = useState('12');
  const [years, setYears] = useState('1');
  const [monthlyContrib, setMonthlyContrib] = useState('0');

  const savingFuture = useMemo(() => (
    compoundInterest(Number(principal) || 0,
      Number(annualRate) || 0, Number(timesPerYear) || 1,
      Number(years) || 0, Number(monthlyContrib) || 0)
  ), [principal, annualRate, timesPerYear, years,
    monthlyContrib]);

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Lãi suất tiết kiệm (lãi kép)
      </Text>
      <LabeledInput
        label="Gốc"
        value={principal}
        onChangeText={setPrincipal}
        placeholder="VD: 10000000"
      />
      <LabeledInput
        label="Lãi năm"
        value={annualRate}
        onChangeText={setAnnualRate}
        placeholder="VD: 0.08"
      />
      <LabeledInput
        label="Số lần/năm"
        value={timesPerYear}
        onChangeText={setTimesPerYear}
        placeholder="VD: 12"
      />
      <LabeledInput
        label="Số năm"
        value={years}
        onChangeText={setYears}
        placeholder="VD: 1"
      />
      <LabeledInput
        label="Góp thêm/tháng"
        value={monthlyContrib}
        onChangeText={setMonthlyContrib}
        placeholder="VD: 0"
      />
      <View style={[styles.card, {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border
      }]}>
        <Text style={[styles.resultText, { color: theme.colors.text }]}>
          Giá trị tương lai:
        </Text>
        <Text style={[styles.resultValue, { color: theme.colors.success }]}>
          {formatCurrency(savingFuture)}
        </Text>
      </View>
    </View>
  );
};

// 4) Component: Khoản vay
const LoanTool = () => {
  const { theme } = useTheme();
  const [loanPrincipal, setLoanPrincipal] = useState('50000000');
  const [loanRate, setLoanRate] = useState('0.12');
  const [loanMonths, setLoanMonths] = useState('24');

  const loanMonthly = useMemo(() => (
    loanMonthlyPayment(Number(loanPrincipal) || 0,
      Number(loanRate) || 0, Number(loanMonths) || 1)
  ), [loanPrincipal, loanRate, loanMonths]);

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Khoản vay - trả hàng tháng
      </Text>
      <LabeledInput
        label="Tiền vay"
        value={loanPrincipal}
        onChangeText={setLoanPrincipal}
        placeholder="VD: 50000000"
      />
      <LabeledInput
        label="Lãi năm"
        value={loanRate}
        onChangeText={setLoanRate}
        placeholder="VD: 0.12"
      />
      <LabeledInput
        label="Số tháng"
        value={loanMonths}
        onChangeText={setLoanMonths}
        placeholder="VD: 24"
      />
      <View style={[styles.card, {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border
      }]}>
        <Text style={[styles.resultText, { color: theme.colors.text }]}>
          Trả hàng tháng:
        </Text>
        <Text style={[styles.resultValue, { color: theme.colors.warning }]}>
          {formatCurrency(loanMonthly)}
        </Text>
      </View>
    </View>
  );
};

// 5) Component: Phân tích chi tiêu
const AnalysisTool = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<{ label: string; value: number; }[]>([]);
  const [total, setTotal] = useState(0);
  const [chartType, setChartType] = useState<'pie' | 'line'>('pie');
  const [lineData, setLineData] = useState<{ labels: string[]; datasets: any[] }>({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const load = async () => {
      try {
        const expenses = await getExpenses();

        // Dữ liệu cho pie chart (theo danh mục)
        const byCat = expenses.reduce<Record<string, number>>((acc, e) => {
          if (!e.category) return acc;
          acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
          return acc;
        }, {});
        const items = Object.entries(byCat)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => ({ label: k, value: v }));
        const sum = items.reduce((s, i) => s + i.value, 0);
        setTotal(sum);
        setData(items);

        // Dữ liệu cho line chart (theo thời gian - 7 ngày gần nhất)
        const now = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - (6 - i));
          return date;
        });

        const dailySpending = last7Days.map(date => {
          const dayExpenses = expenses.filter(e => {
            const expenseDate = new Date(e.date || e.createdAt);
            return expenseDate.toDateString() === date.toDateString();
          });
          return dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        });

        const labels = last7Days.map(date => {
          const day = date.getDate();
          const month = date.getMonth() + 1;
          return `${day}/${month}`;
        });

        setLineData({
          labels,
          datasets: [{
            data: dailySpending,
            color: (opacity = 1) => theme.colors.primary,
            strokeWidth: 3,
          }]
        });
      } catch { }
    };
    load();
  }, [theme.colors.primary]);

  const width = Dimensions.get('window').width - 32;
  const chartData = data.map((it, idx) => ({
    name: it.label,
    population: it.value,
    color: CHART_COLORS[idx % CHART_COLORS.length],
    legendFontColor: theme.colors.text,
    legendFontSize: 12,
  }));

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Phân tích chi tiêu
      </Text>

      {/* Chart Type Toggle */}
      <View style={styles.switchRow}>
        <TouchableOpacity
          onPress={() => setChartType('pie')}
          style={[styles.switchBtn, {
            backgroundColor: chartType === 'pie'
              ? theme.colors.primary
              : theme.colors.card,
            borderColor: chartType === 'pie'
              ? theme.colors.primary
              : theme.colors.border,
            shadowColor: chartType === 'pie' ? theme.colors.primary : '#000',
            shadowOpacity: chartType === 'pie' ? 0.3 : 0.1,
          }]}
        >
          <Text style={{
            color: chartType === 'pie' ? '#fff' : theme.colors.text,
            fontWeight: '600',
            fontSize: 14,
          }}>
            Theo danh mục
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setChartType('line')}
          style={[styles.switchBtn, {
            backgroundColor: chartType === 'line'
              ? theme.colors.primary
              : theme.colors.card,
            borderColor: chartType === 'line'
              ? theme.colors.primary
              : theme.colors.border,
            shadowColor: chartType === 'line' ? theme.colors.primary : '#000',
            shadowOpacity: chartType === 'line' ? 0.3 : 0.1,
          }]}
        >
          <Text style={{
            color: chartType === 'line' ? '#fff' : theme.colors.text,
            fontWeight: '600',
            fontSize: 14,
          }}>
            Xu hướng 7 ngày
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border
      }]}>
        {data.length === 0 ? (
          <Text style={[styles.resultText, { color: theme.colors.textSecondary }]}>
            Chưa có dữ liệu
          </Text>
        ) : (
          <>
            {chartType === 'pie' ? (
              <>
                <PieChart
                  data={chartData}
                  width={width}
                  height={200}
                  accessor={'population'}
                  backgroundColor={'transparent'}
                  paddingLeft={'8'}
                  hasLegend={true}
                  chartConfig={{
                    color: () => theme.colors.primary,
                    labelColor: () => theme.colors.text,
                    backgroundGradientFrom: theme.colors.card,
                    backgroundGradientTo: theme.colors.card,
                  }}
                />
                <View style={{ marginTop: 12 }}>
                  {data.map((it) => (
                    <View key={it.label} style={styles.categoryItem}>
                      <Text style={[styles.categoryLabel, { color: theme.colors.text }]}>
                        {it.label}
                      </Text>
                      <Text style={[styles.categoryValue, { color: theme.colors.textSecondary }]}>
                        {((it.value / total) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <>
                <LineChart
                  data={lineData}
                  width={width}
                  height={220}
                  chartConfig={{
                    backgroundColor: theme.colors.card,
                    backgroundGradientFrom: theme.colors.card,
                    backgroundGradientTo: theme.colors.card,
                    decimalPlaces: 0,
                    color: (opacity = 1) => theme.colors.primary,
                    labelColor: (opacity = 1) => theme.colors.text,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: theme.colors.primary
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: "",
                      stroke: theme.colors.border,
                      strokeWidth: 1
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.resultText, { color: theme.colors.text }]}>
                    Tổng chi tiêu 7 ngày:
                  </Text>
                  <Text style={[styles.resultValue, { color: theme.colors.primary }]}>
                    {formatCurrency(lineData.datasets[0]?.data.reduce((sum: number, val: number) => sum + val, 0) || 0)}
                  </Text>
                </View>
              </>
            )}
          </>
        )}
      </View>
    </View>
  );
};

// Màn hình bộ công cụ: chọn qua các button
const ToolsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [active, setActive] = useState<'budget' | 'forecast' | 'saving' | 'loan' | 'analysis'>('budget');
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const Button = ({ keyId, label }: { keyId: typeof active; label: string }) => (
    <TouchableOpacity
      onPress={() => setActive(keyId)}
      style={[styles.switchBtn, {
        backgroundColor: active === keyId
          ? theme.colors.primary
          : theme.colors.card,
        borderColor: active === keyId
          ? theme.colors.primary
          : theme.colors.border,
        shadowColor: active === keyId ? theme.colors.primary : '#000',
        shadowOpacity: active === keyId ? 0.3 : 0.1,
      }]}
    >
      <Text style={{
        color: active === keyId ? '#fff' : theme.colors.text,
        fontWeight: '600',
        fontSize: 14,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <ScrollView
      style={[styles.container, {
        backgroundColor: theme.colors.background,
      }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode={Platform.OS === 'ios'
        ? 'interactive' : 'on-drag'}
    >
      <View style={styles.switchRow}>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Recurring')}
          style={[styles.switchBtn, {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
          }]}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
            Giao dịch định kỳ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            try {
              setExporting(true);
              const expenses = await getExpenses();
              const csv = expensesToCSV(expenses as any);
              const path = FileSystem.cacheDirectory + 'vinho-expenses.csv';
              await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
              alert(`Đã lưu CSV tại: ${path}`);
            } catch {}
            finally { setExporting(false); }
          }}
          disabled={exporting}
          style={[styles.switchBtn, {
            backgroundColor: exporting ? theme.colors.card : theme.colors.primary,
            borderColor: theme.colors.primary,
          }]}
        >
          <Text style={{ color: exporting ? theme.colors.text : '#fff', fontWeight: '600', fontSize: 14 }}>
            {exporting ? 'Đang xuất...' : 'Xuất CSV'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            try {
              setImporting(true);
              // Nhập tối giản: paste CSV từ một nơi khác vào input prompt
              const pasted = prompt('Dán CSV vào đây');
              if (!pasted) return;
              const rows = csvToExpenses(pasted);
              const existing = await getExpenses();
              const toAdd = rows.map(r => ({ ...r }));
              const merged = [
                ...toAdd.map(r => ({ ...r, id: Date.now().toString() + Math.random(), createdAt: new Date().toISOString() })),
                ...existing,
              ];
              await saveExpenses(merged as any);
              alert('Đã nhập CSV.');
            } catch {}
            finally { setImporting(false); }
          }}
          disabled={importing}
          style={[styles.switchBtn, {
            backgroundColor: importing ? theme.colors.card : theme.colors.primary,
            borderColor: theme.colors.primary,
          }]}
        >
          <Text style={{ color: importing ? theme.colors.text : '#fff', fontWeight: '600', fontSize: 14 }}>
            {importing ? 'Đang nhập...' : 'Nhập CSV (Clipboard)'}
          </Text>
        </TouchableOpacity>
        <Button keyId="budget" label="Ngân sách" />
        <Button keyId="forecast" label="Dự đoán" />
        <Button keyId="saving" label="Tiết kiệm" />
        <Button keyId="loan" label="Vay" />
        <Button keyId="analysis" label="Phân tích" />

      </View>

      {active === 'budget' && <BudgetTool />}
      {active === 'forecast' && <ForecastTool />}
      {active === 'saving' && <SavingTool />}
      {active === 'loan' && <LoanTool />}
      {active === 'analysis' && <AnalysisTool />}
    </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 12
  },
  content: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  switchBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  categoryLabel: {
    fontSize: 14,
    flex: 1,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ToolsScreen;
