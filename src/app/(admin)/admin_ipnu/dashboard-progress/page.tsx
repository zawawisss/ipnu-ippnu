'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Divider, Progress, Button, Chip } from '@heroui/react';
import { PlusIcon, PhoneIcon, ChatBubbleBottomCenterIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ProgressUpdateData {
  _id: string;
  unit_name: string;
  program_no: string;
  progress_percentage: number;
  update_method: string;
  whatsapp_phone?: string;
  timestamp: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  program_kerja_id: {
    nama: string;
    organisasi: string;
    unit_name: string;
    status: string;
    progress_percentage: number;
  };
}

interface WhatsAppContactData {
  _id: string;
  unit_name: string;
  unit_type: string;
  ketua_name: string;
  whatsapp_phone: string;
  is_active: boolean;
  reminder_count: number;
  last_reminder_sent?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardProgressPage() {
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdateData[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContactData[]>([]);
  const [reminderStats, setReminderStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [organisasi, setOrganisasi] = useState('IPNU');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch progress updates
      const progressRes = await fetch(`/api/whatsapp-progress?organisasi=${organisasi}`);
      const progressData = await progressRes.json();
      
      // Fetch contacts
      const contactsRes = await fetch(`/api/whatsapp-contacts?organisasi=${organisasi}&is_active=true`);
      const contactsData = await contactsRes.json();
      
      // Fetch reminder stats
      const reminderRes = await fetch(`/api/whatsapp-reminder?organisasi=${organisasi}`);
      const reminderData = await reminderRes.json();
      
      if (progressData.success) {
        setProgressUpdates(progressData.data);
      }
      
      if (contactsData.success) {
        setContacts(contactsData.data);
      }
      
      if (reminderData.success) {
        setReminderStats(reminderData.data);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async () => {
    try {
      setSendingReminder(true);
      
      const response = await fetch('/api/whatsapp-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organisasi }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ ${result.message}`);
        fetchData(); // Refresh data
      } else {
        alert(`❌ ${result.error}`);
      }
      
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('❌ Gagal mengirim reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  const verifyProgress = async (updateId: string, action: 'VERIFIED' | 'REJECTED') => {
    try {
      const response = await fetch('/api/whatsapp-progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: updateId, status: action }),
      });
      
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error verifying progress:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [organisasi]);

  // Data untuk chart
  const chartData = progressUpdates.reduce((acc: any[], update) => {
    const existing = acc.find(item => item.unit_name === update.unit_name);
    if (existing) {
      existing.total_updates += 1;
      existing.avg_progress = (existing.avg_progress + update.progress_percentage) / 2;
    } else {
      acc.push({
        unit_name: update.unit_name,
        total_updates: 1,
        avg_progress: update.progress_percentage,
      });
    }
    return acc;
  }, []);

  // Data untuk pie chart status
  const statusData = [
    { name: 'Pending', value: progressUpdates.filter(u => u.status === 'PENDING').length },
    { name: 'Verified', value: progressUpdates.filter(u => u.status === 'VERIFIED').length },
    { name: 'Rejected', value: progressUpdates.filter(u => u.status === 'REJECTED').length },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Progress WhatsApp</h1>
          <p className="text-gray-600">Monitoring progress program kerja via WhatsApp PC IPNU Ponorogo</p>
        </div>
        
        <div className="flex gap-3">
          <select 
            value={organisasi} 
            onChange={(e) => setOrganisasi(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="IPNU">IPNU</option>
            <option value="IPPNU">IPPNU</option>
            <option value="KOORDINATIF">KOORDINATIF</option>
          </select>
          
          <Button
            color="primary"
            startContent={<ChatBubbleBottomCenterIcon className="w-4 h-4" />}
            onPress={sendReminder}
            isLoading={sendingReminder}
          >
            Kirim Reminder
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
            <div className="text-sm text-gray-600">Kontak Aktif</div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-green-600">{progressUpdates.length}</div>
            <div className="text-sm text-gray-600">Total Updates</div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {progressUpdates.filter(u => u.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-600">Pending Verifikasi</div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {reminderStats?.stats.total_reminders_sent || 0}
            </div>
            <div className="text-sm text-gray-600">Reminder Terkirim</div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress by Unit */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Progress per Unit</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="unit_name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value, name) => [value + '%', 'Rata-rata Progress']} />
                <Bar dataKey="avg_progress" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Status Updates</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Update Terbaru</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {progressUpdates.slice(0, 10).map((update) => (
              <div key={update._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{update.unit_name}</span>
                    <Chip size="sm" variant="flat">
                      #{update.program_no}
                    </Chip>
                    <Chip 
                      size="sm" 
                      color={update.status === 'VERIFIED' ? 'success' : update.status === 'REJECTED' ? 'danger' : 'warning'}
                    >
                      {update.status}
                    </Chip>
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-1">
                    {update.program_kerja_id?.nama || 'Program tidak ditemukan'}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <Progress 
                      value={update.progress_percentage} 
                      className="flex-1 max-w-xs" 
                      color="primary"
                    />
                    <span className="text-sm font-medium">{update.progress_percentage}%</span>
                    
                    <div className="text-xs text-gray-500">
                      {new Date(update.timestamp).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                </div>
                
                {update.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="success"
                      onPress={() => verifyProgress(update._id, 'VERIFIED')}
                    >
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => verifyProgress(update._id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Kontak WhatsApp Terdaftar</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <div key={contact._id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <PhoneIcon className="w-4 h-4" />
                  <span className="font-medium">{contact.ketua_name}</span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{contact.unit_name} ({contact.unit_type})</div>
                  <div>{contact.whatsapp_phone}</div>
                  <div>Reminder: {contact.reminder_count}x</div>
                  {contact.last_reminder_sent && (
                    <div className="text-xs">
                      Terakhir: {new Date(contact.last_reminder_sent).toLocaleDateString('id-ID')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
