import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Box, Button, ButtonGroup, Checkbox, DatePicker, DynamicTable, Heading, Inline, Label, Link, Lozenge,
  SectionMessage, Select, Spinner, Stack, Tab, TabList, TabPanel, Tabs, Text, Textfield, useProductContext,
} from '@forge/react';
import { invoke } from '@forge/bridge';

const LEVEL = {
  overdue: { text: 'Overdue', appearance: 'removed' },
  today: { text: 'Due today', appearance: 'removed' },
  week: { text: 'This week', appearance: 'moved' },
  month: { text: 'This month', appearance: 'inprogress' },
  later: { text: 'Later', appearance: 'default' },
};
const FLAG = { JP: '🇯🇵', UK: '🇬🇧', US: '🇺🇸', FR: '🇫🇷', KR: '🇰🇷' };
const COUNTRY_OPTIONS = [
  { label: '🇯🇵 Japan', value: 'JP' }, { label: '🇬🇧 United Kingdom', value: 'UK' }, { label: '🇺🇸 United States (federal)', value: 'US' },
  { label: '🇫🇷 France', value: 'FR' }, { label: '🇰🇷 South Korea', value: 'KR' },
];
const ENTITY_OPTIONS = [{ label: 'C corporation (Form 1120)', value: 'ccorp' }, { label: 'S corporation (Form 1120-S)', value: 'scorp' }, { label: 'Partnership (Form 1065)', value: 'partnership' }];
const WINDOW_OPTIONS = [{ label: 'Next 30 days', value: 30 }, { label: 'Next 90 days', value: 90 }, { label: 'Next 6 months', value: 183 }, { label: 'Next 12 months', value: 365 }];

const emptyForm = { name: '', country: 'UK', yearEnd: '2026-12-31', entity: 'ccorp', consumptionTax: true, extensionFiled: false, firstAccounts: false, incorporated: '', online: true, sincere: false };

function Summary({ counts }) {
  return (
    <Inline space="space.200" shouldWrap>
      {['overdue', 'today', 'week', 'month', 'later'].map((k) => (
        <Box key={k} padding="space.150" backgroundColor={k === 'overdue' && counts[k] ? 'color.background.danger' : 'color.background.neutral'} xcss={{ borderRadius: 'border.radius.200', minWidth: '120px' }}>
          <Stack space="space.050">
            <Text size="small">{LEVEL[k].text}</Text>
            <Heading as="h3">{String(counts[k] ?? 0)}</Heading>
          </Stack>
        </Box>
      ))}
    </Inline>
  );
}

function Board({ rows, siteUrl }) {
  const head = { cells: ['Client', 'Filing', 'Due', 'When', 'Jira task'].map((c) => ({ key: c, content: c })) };
  const tableRows = rows.map((r) => ({
    key: r.key,
    cells: [
      { key: 'c', content: `${FLAG[r.country] ?? ''} ${r.clientName}` },
      { key: 'f', content: <Stack space="space.025"><Text>{r.label}</Text><Text size="small" color="color.text.subtle">{r.cite}</Text></Stack> },
      { key: 'd', content: r.due },
      { key: 'w', content: <Lozenge appearance={LEVEL[r.level].appearance} isBold={r.level === 'overdue'}>{r.days < 0 ? `${-r.days}d late` : r.days === 0 ? 'today' : `${r.days}d`}</Lozenge> },
      { key: 'j', content: r.issueKey ? <Inline space="space.050"><Link href={`${siteUrl}/browse/${r.issueKey}`}>{r.issueKey}</Link><Text size="small">{r.status ?? ''}</Text></Inline> : <Text size="small" color="color.text.subtlest">not created</Text> },
    ],
  }));
  return <DynamicTable head={head} rows={tableRows} rowsPerPage={15} emptyView="No open filing deadlines in this window." />;
}

function ClientForm({ onSaved }) {
  const [f, setF] = useState(emptyForm);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const save = async () => {
    setBusy(true);
    const r = await invoke('addClient', f);
    setBusy(false);
    if (r.ok) { setMsg({ ok: true, text: `Saved ${r.client.name}.` }); setF(emptyForm); onSaved(); } else setMsg({ ok: false, text: r.errors.join(' ') });
  };
  return (
    <Stack space="space.150">
      <Label labelFor="dd-name">Client name</Label>
      <Textfield id="dd-name" value={f.name} onChange={(e) => set('name')(e.target.value)} placeholder="Thames Robotics Ltd" />
      <Label labelFor="dd-country">Country</Label>
      <Select inputId="dd-country" options={COUNTRY_OPTIONS} value={COUNTRY_OPTIONS.find((o) => o.value === f.country)} onChange={(o) => set('country')(o.value)} />
      <Label labelFor="dd-ye">Financial year end</Label>
      <DatePicker id="dd-ye" value={f.yearEnd} onChange={set('yearEnd')} />
      {f.country === 'US' && (<><Label labelFor="dd-entity">Entity</Label><Select inputId="dd-entity" options={ENTITY_OPTIONS} value={ENTITY_OPTIONS.find((o) => o.value === f.entity)} onChange={(o) => set('entity')(o.value)} /></>)}
      {f.country === 'JP' && (<><Checkbox label="Consumption tax registered" isChecked={f.consumptionTax} onChange={(e) => set('consumptionTax')(e.target.checked)} /><Checkbox label="Consumption tax 1-month extension filed" isChecked={f.extensionFiled} onChange={(e) => set('extensionFiled')(e.target.checked)} /></>)}
      {f.country === 'UK' && (<><Checkbox label="First accounts after incorporation" isChecked={f.firstAccounts} onChange={(e) => set('firstAccounts')(e.target.checked)} />{f.firstAccounts && (<><Label labelFor="dd-inc">Incorporation date</Label><DatePicker id="dd-inc" value={f.incorporated} onChange={set('incorporated')} /></>)}</>)}
      {f.country === 'FR' && <Checkbox label="Accounts filed online (2 months instead of 1)" isChecked={f.online} onChange={(e) => set('online')(e.target.checked)} />}
      {f.country === 'KR' && <Checkbox label="Sincere-filing confirmation required (성실신고확인)" isChecked={f.sincere} onChange={(e) => set('sincere')(e.target.checked)} />}
      <Inline><Button appearance="primary" onClick={save} isDisabled={busy}>Save client</Button></Inline>
      {msg && <SectionMessage appearance={msg.ok ? 'success' : 'error'}><Text>{msg.text}</Text></SectionMessage>}
    </Stack>
  );
}

function App() {
  const ctx = useProductContext();
  const projectKey = ctx?.extension?.project?.key;
  const siteUrl = ctx?.siteUrl ?? '';
  const [data, setData] = useState(null);
  const [days, setDays] = useState(90);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = async (d = days) => setData(await invoke('getBoard', { days: d }));
  useEffect(() => { load(); }, []);

  const createTasks = async () => {
    setBusy(true);
    const r = await invoke('createTasks', { projectKey, days });
    setBusy(false);
    setNotice(r.errors ? { ok: false, text: r.errors.join(' ') }
      : { ok: !r.failed?.length, text: r.created.length ? `Created ${r.created.length} Jira task(s) in ${r.projectKey}.${r.failed?.length ? ` ${r.failed.length} failed.` : ''}` : 'Every deadline in this window already has a task.' });
    load();
  };
  const sample = async () => { await invoke('loadSample'); load(); };
  const remove = async (id) => { await invoke('removeClient', { id }); load(); };

  if (!data) return <Spinner label="Loading DueDesk" />;
  const { board, clients } = data;

  return (
    <Stack space="space.300">
      <Stack space="space.100">
        <Heading as="h2">DueDesk: every client's statutory filing deadline, as Jira work</Heading>
        <Text>Add each client's country and financial year end once. DueDesk computes company filing deadlines for Japan, the UK, the US, France and South Korea, creates one Jira task per filing with the due date and the legal source, and comments on open tasks 7 days before, on the day and when overdue. Ask the DueDesk agent in Rovo: "What is due for my clients in the next 30 days?"</Text>
      </Stack>
      {clients.length === 0 && (
        <SectionMessage title="No clients yet" appearance="information" actions={[<Button key="s" onClick={sample}>Load a sample firm (6 clients, 5 countries)</Button>]}>
          <Text>Add your first client on the Clients tab, or load the sample firm to see the board in action.</Text>
        </SectionMessage>
      )}
      <Tabs id="dd-tabs">
        <TabList>
          <Tab>Deadline board</Tab>
          <Tab>Clients ({String(clients.length)})</Tab>
          <Tab>How it works</Tab>
        </TabList>
        <TabPanel>
          <Box paddingBlock="space.200">
            <Stack space="space.200">
              <Summary counts={board.counts} />
              <Inline space="space.150" alignBlock="center" shouldWrap>
                <Box xcss={{ width: '220px' }}><Select inputId="dd-window" options={WINDOW_OPTIONS} value={WINDOW_OPTIONS.find((o) => o.value === days)} onChange={(o) => { setDays(o.value); load(o.value); }} /></Box>
                <ButtonGroup>
                  <Button appearance="primary" onClick={createTasks} isDisabled={busy || !clients.length || !projectKey}>{busy ? 'Creating…' : `Create Jira tasks in ${projectKey ?? 'this project'}`}</Button>
                  <Button onClick={() => load()}>Refresh</Button>
                </ButtonGroup>
              </Inline>
              {notice && <SectionMessage appearance={notice.ok ? 'success' : 'warning'}><Text>{notice.text}</Text></SectionMessage>}
              <Board rows={board.rows} siteUrl={siteUrl} />
              <Text size="small" color="color.text.subtlest">Window {board.from} to {board.to}. Weekend due dates move to Monday (UK dates are fixed). Public holidays are not applied. Rules as of {data.rulesAsOf}. General information, not tax advice.</Text>
            </Stack>
          </Box>
        </TabPanel>
        <TabPanel>
          <Box paddingBlock="space.200">
            <Inline space="space.400" shouldWrap alignBlock="start">
              <Box xcss={{ minWidth: '320px', maxWidth: '420px' }}><Heading as="h4">Add a client</Heading><ClientForm onSaved={() => load()} /></Box>
              <Box xcss={{ minWidth: '360px' }}>
                <Heading as="h4">Clients</Heading>
                <DynamicTable
                  head={{ cells: ['Client', 'Country', 'Year end', ''].map((c) => ({ key: c || 'x', content: c })) }}
                  rows={clients.map((c) => ({ key: c.id, cells: [
                    { key: 'n', content: c.name }, { key: 'c', content: `${FLAG[c.country]} ${c.country}${c.entity ? ` · ${c.entity}` : ''}` },
                    { key: 'y', content: c.yearEnd.slice(5) }, { key: 'r', content: <Button appearance="subtle" onClick={() => remove(c.id)}>Remove</Button> },
                  ] }))}
                  emptyView="No clients yet."
                />
                {clients.length > 0 && <Button appearance="link" onClick={sample}>Add the sample clients</Button>}
              </Box>
            </Inline>
          </Box>
        </TabPanel>
        <TabPanel>
          <Box paddingBlock="space.200">
            <Stack space="space.150">
              <Text>1. Each client stores only a name, a country, a financial year end and one or two filing options. No financial data leaves Jira.</Text>
              <Text>2. The rules engine turns that into dated obligations (for example: UK accounts 9 months after year end, Corporation Tax 9 months and 1 day, CT600 12 months; Korean corporate tax by the end of the 3rd month).</Text>
              <Text>3. "Create Jira tasks" makes one task per filing with the due date, labels (duedesk, country, client) and a description holding the source and the late-filing penalty. It never creates the same filing twice.</Text>
              <Text>4. A daily trigger comments on open tasks 7 days before, on the day and when overdue, so the assignee gets a normal Jira notification.</Text>
              <Text>5. The DueDesk Rovo agent and the DueDesk MCP tools answer "what is due", add clients, create tasks and draft reminder emails to clients from the same data.</Text>
            </Stack>
          </Box>
        </TabPanel>
      </Tabs>
    </Stack>
  );
}

ForgeReconciler.render(<React.StrictMode><App /></React.StrictMode>);
