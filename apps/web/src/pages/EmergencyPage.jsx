import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import EmergencyContactCard from '@/components/EmergencyContactCard.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Phone,
  Stethoscope,
  FileText,
  AlertCircle,
  Pencil,
  Trash2,
  Shield,
  Scale,
  Loader2,
} from 'lucide-react';
import {
  getEmergencyData,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  addEmergencyDoctor,
  updateEmergencyDoctor,
  deleteEmergencyDoctor,
  addEmergencyMedication,
  updateEmergencyMedication,
  deleteEmergencyMedication,
  addEmergencyInsuranceCard,
  updateEmergencyInsuranceCard,
  deleteEmergencyInsuranceCard,
  addEmergencyLegalDirective,
  updateEmergencyLegalDirective,
  deleteEmergencyLegalDirective,
  addEmergencyChecklistItem,
  toggleEmergencyChecklistItem,
  deleteEmergencyChecklistItem,
} from '@/lib/emergency.js';

const emptyContactForm = {
  name: '',
  relationship: '',
  phone: '',
  email: '',
  address: '',
};

const emptyDoctorForm = {
  name: '',
  specialty: '',
  phone: '',
  address: '',
};

const emptyMedicationForm = {
  name: '',
  person: '',
  dosage: '',
  prescriber: '',
};

const emptyInsuranceForm = {
  type: '',
  provider: '',
  policyNumber: '',
  groupNumber: '',
};

const emptyLegalForm = {
  title: '',
  status: 'Current',
  lastUpdated: '',
};

const emptyChecklistForm = {
  item: '',
};

function EmergencyPage() {
  const [activeTab, setActiveTab] = useState('contacts');

  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medications, setMedications] = useState([]);
  const [insuranceCards, setInsuranceCards] = useState([]);
  const [legalDirectives, setLegalDirectives] = useState([]);
  const [criticalChecklist, setCriticalChecklist] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [doctorDialogOpen, setDoctorDialogOpen] = useState(false);
  const [medicationDialogOpen, setMedicationDialogOpen] = useState(false);
  const [insuranceDialogOpen, setInsuranceDialogOpen] = useState(false);
  const [legalDialogOpen, setLegalDialogOpen] = useState(false);
  const [checklistDialogOpen, setChecklistDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editingContact, setEditingContact] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editingMedication, setEditingMedication] = useState(null);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const [editingLegal, setEditingLegal] = useState(null);

  const [contactForm, setContactForm] = useState(emptyContactForm);
  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm);
  const [medicationForm, setMedicationForm] = useState(emptyMedicationForm);
  const [insuranceForm, setInsuranceForm] = useState(emptyInsuranceForm);
  const [legalForm, setLegalForm] = useState(emptyLegalForm);
  const [checklistForm, setChecklistForm] = useState(emptyChecklistForm);

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadEmergencyData();
  }, []);

  async function loadEmergencyData() {
    setLoading(true);
    setErrorText('');

    try {
      const data = await getEmergencyData();
      setEmergencyContacts(data.contacts || []);
      setDoctors(data.doctors || []);
      setMedications(data.medications || []);
      setInsuranceCards(data.insuranceCards || []);
      setLegalDirectives(data.legalDirectives || []);
      setCriticalChecklist(data.checklistItems || []);
    } catch (error) {
      console.error('Failed to load emergency info:', error);
      setErrorText(error?.message || 'Failed to load emergency info.');
    } finally {
      setLoading(false);
    }
  }

  const checklistProgress = useMemo(() => {
    const total = criticalChecklist.length;
    const complete = criticalChecklist.filter((item) => item.checked).length;
    return { total, complete };
  }, [criticalChecklist]);

  function resetContactForm() {
    setEditingContact(null);
    setContactForm(emptyContactForm);
  }

  function resetDoctorForm() {
    setEditingDoctor(null);
    setDoctorForm(emptyDoctorForm);
  }

  function resetMedicationForm() {
    setEditingMedication(null);
    setMedicationForm(emptyMedicationForm);
  }

  function resetInsuranceForm() {
    setEditingInsurance(null);
    setInsuranceForm(emptyInsuranceForm);
  }

  function resetLegalForm() {
    setEditingLegal(null);
    setLegalForm(emptyLegalForm);
  }

  function resetChecklistForm() {
    setChecklistForm(emptyChecklistForm);
  }

  function openDeleteDialog(type, id, label) {
    setDeleteTarget({ type, id, label });
    setDeleteDialogOpen(true);
  }

  function openAddContactDialog() {
    resetContactForm();
    setContactDialogOpen(true);
  }

  function openEditContactDialog(contact) {
    setEditingContact(contact);
    setContactForm({
      name: contact.name || '',
      relationship: contact.relationship || '',
      phone: contact.phone || '',
      email: contact.email || '',
      address: contact.address || '',
    });
    setContactDialogOpen(true);
  }

  function openAddDoctorDialog() {
    resetDoctorForm();
    setDoctorDialogOpen(true);
  }

  function openEditDoctorDialog(doctor) {
    setEditingDoctor(doctor);
    setDoctorForm({
      name: doctor.name || '',
      specialty: doctor.specialty || '',
      phone: doctor.phone || '',
      address: doctor.address || '',
    });
    setDoctorDialogOpen(true);
  }

  function openAddMedicationDialog() {
    resetMedicationForm();
    setMedicationDialogOpen(true);
  }

  function openEditMedicationDialog(medication) {
    setEditingMedication(medication);
    setMedicationForm({
      name: medication.name || '',
      person: medication.person || '',
      dosage: medication.dosage || '',
      prescriber: medication.prescriber || '',
    });
    setMedicationDialogOpen(true);
  }

  function openAddInsuranceDialog() {
    resetInsuranceForm();
    setInsuranceDialogOpen(true);
  }

  function openEditInsuranceDialog(card) {
    setEditingInsurance(card);
    setInsuranceForm({
      type: card.type || '',
      provider: card.provider || '',
      policyNumber: card.policyNumber || '',
      groupNumber: card.groupNumber || '',
    });
    setInsuranceDialogOpen(true);
  }

  function openAddLegalDialog() {
    resetLegalForm();
    setLegalDialogOpen(true);
  }

  function openEditLegalDialog(directive) {
    setEditingLegal(directive);
    setLegalForm({
      title: directive.title || '',
      status: directive.status || 'Current',
      lastUpdated: directive.lastUpdated || '',
    });
    setLegalDialogOpen(true);
  }

  function openAddChecklistDialog() {
    resetChecklistForm();
    setChecklistDialogOpen(true);
  }

  async function handleSaveContact(e) {
    e.preventDefault();
    if (!contactForm.name.trim()) return;

    setSaving(true);
    setErrorText('');
    setSuccessText('');

    try {
      if (editingContact?.id) {
        await updateEmergencyContact(editingContact.id, contactForm);
        setSuccessText('Contact updated.');
      } else {
        await addEmergencyContact(contactForm);
        setSuccessText('Contact added.');
      }

      setContactDialogOpen(false);
      resetContactForm();
      await loadEmergencyData();
    } catch (error) {
      setErrorText(error?.message || 'Failed to save contact.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDoctor(e) {
    e.preventDefault();
    if (!doctorForm.name.trim()) return;

    setSaving(true);
    setErrorText('');
    setSuccessText('');

    try {
      if (editingDoctor?.id) {
        await updateEmergencyDoctor(editingDoctor.id, doctorForm);
        setSuccessText('Doctor updated.');
      } else {
        await addEmergencyDoctor(doctorForm);
        setSuccessText('Doctor added.');
      }

      setDoctorDialogOpen(false);
      resetDoctorForm();
      await loadEmergencyData();
    } catch (error) {
      setErrorText(error?.message || 'Failed to save doctor.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveMedication(e) {
    e.preventDefault();
    if (!medicationForm.name.trim()) return;

    setSaving(true);
    setErrorText('');
    setSuccessText('');

    try {
      if (editingMedication?.id) {
        await updateEmergencyMedication(editingMedication.id, medicationForm);
        setSuccessText('Medication updated.');
      } else {
        await addEmergencyMedication(medicationForm);
        setSuccessText('Medication added.');
      }

      setMedicationDialogOpen(false);
      resetMedicationForm();
      await loadEmergencyData();
    } catch (error) {
      setErrorText(error?.message || 'Failed to save medication.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveInsurance(e) {
    e.preventDefault();
    if (!insuranceForm.type.trim()) return;

    setSaving(true);
    setErrorText('');
    setSuccessText('');

    try {
      if (editingInsurance?.id) {
        await updateEmergencyInsuranceCard(editingInsurance.id, insuranceForm);
        setSuccessText('Insurance card updated.');
      } else {
        await addEmergencyInsuranceCard(insuranceForm);
        setSuccessText('Insurance card added.');
      }

      setInsuranceDialogOpen(false);
      resetInsuranceForm();
      await loadEmergencyData();
    } catch (error) {
      setErrorText(error?.message || 'Failed to save insurance card.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveLegal(e) {
    e.preventDefault();
    if (!legalForm.title.trim()) return;

    setSaving(true);
    setErrorText('');
    setSuccessText('');

    try {
      if (editingLegal?.id) {
        await updateEmergencyLegalDirective(editingLegal.id, legalForm);
        setSuccessText('Directive updated.');
      } else {
        await addEmergencyLegalDirective(legalForm);
        setSuccessText('Directive added.');
      }

      setLegalDialogOpen(false);
      resetLegalForm();
      await loadEmergencyData();
    } catch (error) {
      setErrorText(error?.message || 'Failed to save directive.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveChecklistItem(e) {
    e.preventDefault();
    if (!checklistForm.item.trim()) return;

    setSaving(true);
    setErrorText('');
    setSuccessText('');

    try {
      await addEmergencyChecklistItem({
        item: checklistForm.item.trim(),
        checked: false,
      });

      setChecklistDialogOpen(false);
      resetChecklistForm();
      setSuccessText('Checklist item added.');
      await loadEmergencyData();
    } catch (error) {
      setErrorText(error?.message || 'Failed to add checklist item.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleChecklistItem(id, checked) {
    setErrorText('');
    setSuccessText('');

    try {
      await toggleEmergencyChecklistItem(id, checked);
      await loadEmergencyData();
    } catch (error) {
      setErrorText(error?.message || 'Failed to update checklist item.');
    }
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;

    setSaving(true);
    setErrorText('');
    setSuccessText('');

    try {
      if (deleteTarget.type === 'contact') {
        await deleteEmergencyContact(deleteTarget.id);
      }
      if (deleteTarget.type === 'doctor') {
        await deleteEmergencyDoctor(deleteTarget.id);
      }
      if (deleteTarget.type === 'medication') {
        await deleteEmergencyMedication(deleteTarget.id);
      }
      if (deleteTarget.type === 'insurance') {
        await deleteEmergencyInsuranceCard(deleteTarget.id);
      }
      if (deleteTarget.type === 'legal') {
        await deleteEmergencyLegalDirective(deleteTarget.id);
      }
      if (deleteTarget.type === 'checklist') {
        await deleteEmergencyChecklistItem(deleteTarget.id);
      }

      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setSuccessText('Item deleted.');
      await loadEmergencyData();
    } catch (error) {
      setErrorText(error?.message || 'Failed to delete item.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Emergency Info - FamilyHub</title>
        <meta
          name="description"
          content="Critical emergency contacts, medical information, and important documents"
        />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Emergency Info</h2>
            <p className="text-muted-foreground">
              Quick access to critical household contacts, medical info, and documents.
            </p>
          </div>

          <Button className="gap-2 rounded-xl shadow-sm" onClick={openAddContactDialog}>
            <Plus className="h-4 w-4" />
            Add contact
          </Button>
        </div>

        {(errorText || successText) && (
          <div className="space-y-2">
            {errorText ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorText}
              </div>
            ) : null}
            {successText ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {successText}
              </div>
            ) : null}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            icon={<Phone className="h-5 w-5 text-muted-foreground" />}
            label="Emergency Contacts"
            value={emergencyContacts.length}
          />
          <SummaryCard
            icon={<Stethoscope className="h-5 w-5 text-muted-foreground" />}
            label="Doctors & Meds"
            value={doctors.length + medications.length}
          />
          <SummaryCard
            icon={<AlertCircle className="h-5 w-5 text-muted-foreground" />}
            label="Checklist Complete"
            value={`${checklistProgress.complete}/${checklistProgress.total}`}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="contacts" className="text-xs sm:text-sm">
              Emergency contacts
            </TabsTrigger>
            <TabsTrigger value="doctors" className="text-xs sm:text-sm">
              Doctors & meds
            </TabsTrigger>
            <TabsTrigger value="insurance" className="text-xs sm:text-sm">
              Insurance cards
            </TabsTrigger>
            <TabsTrigger value="legal" className="text-xs sm:text-sm">
              Legal directives
            </TabsTrigger>
            <TabsTrigger value="checklist" className="text-xs sm:text-sm">
              Critical checklist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2 rounded-xl" onClick={openAddContactDialog}>
                <Plus className="h-4 w-4" />
                Add contact
              </Button>
            </div>

            {loading ? (
              <LoadingCard text="Loading emergency contacts..." />
            ) : emergencyContacts.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="space-y-2">
                    <EmergencyContactCard contact={contact} />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => openEditContactDialog(contact)}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog('contact', contact.id, contact.name)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Phone className="h-6 w-6 text-muted-foreground" />}
                title="No emergency contacts yet"
                description="Add emergency contacts so they are easy to reach when needed."
                actionLabel="Add contact"
                onAction={openAddContactDialog}
              />
            )}
          </TabsContent>

          <TabsContent value="doctors" className="space-y-6">
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Stethoscope className="h-5 w-5 text-emerald-600" />
                  Doctors
                </h3>
                <Button variant="outline" className="gap-2 rounded-xl" onClick={openAddDoctorDialog}>
                  <Plus className="h-4 w-4" />
                  Add doctor
                </Button>
              </div>

              {loading ? (
                <LoadingCard text="Loading doctors..." />
              ) : doctors.length ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {doctors.map((doctor) => (
                    <Card key={doctor.id} className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h4 className="mb-2 font-semibold text-sm">{doctor.name}</h4>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>
                                Specialty: <span className="font-medium text-foreground">{doctor.specialty}</span>
                              </p>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span className="font-medium text-foreground">{doctor.phone}</span>
                              </div>
                              <p>{doctor.address}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => openEditDoctorDialog(doctor)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog('doctor', doctor.id, doctor.name)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Stethoscope className="h-6 w-6 text-muted-foreground" />}
                  title="No doctors added yet"
                  description="Add doctors and clinics for quick access."
                  actionLabel="Add doctor"
                  onAction={openAddDoctorDialog}
                />
              )}
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Medications
                </h3>
                <Button variant="outline" className="gap-2 rounded-xl" onClick={openAddMedicationDialog}>
                  <Plus className="h-4 w-4" />
                  Add medication
                </Button>
              </div>

              {loading ? (
                <LoadingCard text="Loading medications..." />
              ) : medications.length ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {medications.map((med) => (
                    <Card key={med.id} className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md">
                      <CardContent className="p-4">
                        <h4 className="mb-2 font-semibold text-sm">{med.name}</h4>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>
                            For: <span className="font-medium text-foreground">{med.person}</span>
                          </p>
                          <p>
                            Dosage: <span className="font-medium text-foreground">{med.dosage}</span>
                          </p>
                          <p>Prescribed by: {med.prescriber}</p>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => openEditMedicationDialog(med)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog('medication', med.id, med.name)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FileText className="h-6 w-6 text-muted-foreground" />}
                  title="No medications added yet"
                  description="Add medications and dosage details for your household."
                  actionLabel="Add medication"
                  onAction={openAddMedicationDialog}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="insurance" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2 rounded-xl" onClick={openAddInsuranceDialog}>
                <Plus className="h-4 w-4" />
                Add insurance card
              </Button>
            </div>

            {loading ? (
              <LoadingCard text="Loading insurance cards..." />
            ) : insuranceCards.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {insuranceCards.map((card) => (
                  <Card key={card.id} className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <Shield className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="mb-1 font-semibold text-base">{card.type}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {card.provider}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Policy #:</span>
                          <span className="font-medium">{card.policyNumber || '—'}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Group #:</span>
                          <span className="font-medium">{card.groupNumber || '—'}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => openEditInsuranceDialog(card)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog('insurance', card.id, card.type)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Shield className="h-6 w-6 text-muted-foreground" />}
                title="No insurance cards yet"
                description="Keep policy numbers and provider details easy to access."
                actionLabel="Add insurance card"
                onAction={openAddInsuranceDialog}
              />
            )}
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" className="gap-2 rounded-xl" onClick={openAddLegalDialog}>
                <Plus className="h-4 w-4" />
                Add directive
              </Button>
            </div>

            {loading ? (
              <LoadingCard text="Loading legal directives..." />
            ) : legalDirectives.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {legalDirectives.map((directive) => (
                  <Card key={directive.id} className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Scale className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="mb-2 font-semibold text-sm">{directive.title}</h4>
                          <div className="mb-3 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {directive.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Updated {directive.lastUpdated || '—'}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => openEditLegalDialog(directive)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog('legal', directive.id, directive.title)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Scale className="h-6 w-6 text-muted-foreground" />}
                title="No legal directives yet"
                description="Store healthcare proxies, living wills, and related notes."
                actionLabel="Add directive"
                onAction={openAddLegalDialog}
              />
            )}
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Emergency preparedness checklist</h3>
                <p className="text-sm text-muted-foreground">
                  {checklistProgress.complete} of {checklistProgress.total} complete
                </p>
              </div>

              <Button variant="outline" className="gap-2 rounded-xl" onClick={openAddChecklistDialog}>
                <Plus className="h-4 w-4" />
                Add checklist item
              </Button>
            </div>

            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading checklist...</div>
                ) : criticalChecklist.length ? (
                  <div className="space-y-3">
                    {criticalChecklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-lg bg-muted p-3"
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() =>
                              handleToggleChecklistItem(item.id, item.checked)
                            }
                            className="mt-0.5"
                          />
                          <span className="flex-1 text-sm">{item.item}</span>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-xl text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog('checklist', item.id, item.item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<AlertCircle className="h-6 w-6 text-muted-foreground" />}
                    title="No checklist items yet"
                    description="Add preparedness tasks to track what still needs attention."
                    actionLabel="Add checklist item"
                    onAction={openAddChecklistDialog}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={contactDialogOpen}
        onOpenChange={(open) => {
          setContactDialogOpen(open);
          if (!open) resetContactForm();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit contact' : 'Add emergency contact'}</DialogTitle>
            <DialogDescription>
              Save an emergency contact for quick access.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveContact} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required>
                <input
                  value={contactForm.name}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Contact name"
                />
              </Field>

              <Field label="Relationship">
                <input
                  value={contactForm.relationship}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, relationship: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Mom, Doctor, Neighbor"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone">
                <input
                  value={contactForm.phone}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Phone number"
                />
              </Field>

              <Field label="Email">
                <input
                  value={contactForm.email}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Email address"
                />
              </Field>
            </div>

            <Field label="Address">
              <input
                value={contactForm.address}
                onChange={(e) => setContactForm((prev) => ({ ...prev, address: e.target.value }))}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                placeholder="Address"
              />
            </Field>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setContactDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingContact ? 'Save changes' : 'Add contact'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={doctorDialogOpen}
        onOpenChange={(open) => {
          setDoctorDialogOpen(open);
          if (!open) resetDoctorForm();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDoctor ? 'Edit doctor' : 'Add doctor'}</DialogTitle>
            <DialogDescription>
              Save a doctor or clinic contact.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDoctor} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required>
                <input
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Doctor name"
                />
              </Field>

              <Field label="Specialty">
                <input
                  value={doctorForm.specialty}
                  onChange={(e) => setDoctorForm((prev) => ({ ...prev, specialty: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Family Medicine"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone">
                <input
                  value={doctorForm.phone}
                  onChange={(e) => setDoctorForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Phone number"
                />
              </Field>

              <Field label="Address">
                <input
                  value={doctorForm.address}
                  onChange={(e) => setDoctorForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Clinic address"
                />
              </Field>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDoctorDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingDoctor ? 'Save changes' : 'Add doctor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={medicationDialogOpen}
        onOpenChange={(open) => {
          setMedicationDialogOpen(open);
          if (!open) resetMedicationForm();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMedication ? 'Edit medication' : 'Add medication'}</DialogTitle>
            <DialogDescription>
              Save medication details and dosage information.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMedication} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Medication name" required>
                <input
                  value={medicationForm.name}
                  onChange={(e) => setMedicationForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Medication name"
                />
              </Field>

              <Field label="For">
                <input
                  value={medicationForm.person}
                  onChange={(e) => setMedicationForm((prev) => ({ ...prev, person: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Person name"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Dosage">
                <input
                  value={medicationForm.dosage}
                  onChange={(e) => setMedicationForm((prev) => ({ ...prev, dosage: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Dosage instructions"
                />
              </Field>

              <Field label="Prescriber">
                <input
                  value={medicationForm.prescriber}
                  onChange={(e) => setMedicationForm((prev) => ({ ...prev, prescriber: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Prescriber name"
                />
              </Field>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMedicationDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingMedication ? 'Save changes' : 'Add medication'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={insuranceDialogOpen}
        onOpenChange={(open) => {
          setInsuranceDialogOpen(open);
          if (!open) resetInsuranceForm();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingInsurance ? 'Edit insurance card' : 'Add insurance card'}</DialogTitle>
            <DialogDescription>
              Save insurance provider and policy information.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveInsurance} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type" required>
                <input
                  value={insuranceForm.type}
                  onChange={(e) => setInsuranceForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Health Insurance"
                />
              </Field>

              <Field label="Provider">
                <input
                  value={insuranceForm.provider}
                  onChange={(e) => setInsuranceForm((prev) => ({ ...prev, provider: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Provider"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Policy Number">
                <input
                  value={insuranceForm.policyNumber}
                  onChange={(e) => setInsuranceForm((prev) => ({ ...prev, policyNumber: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Policy number"
                />
              </Field>

              <Field label="Group Number">
                <input
                  value={insuranceForm.groupNumber}
                  onChange={(e) => setInsuranceForm((prev) => ({ ...prev, groupNumber: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Group number"
                />
              </Field>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInsuranceDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingInsurance ? 'Save changes' : 'Add insurance card'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={legalDialogOpen}
        onOpenChange={(open) => {
          setLegalDialogOpen(open);
          if (!open) resetLegalForm();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLegal ? 'Edit directive' : 'Add legal directive'}</DialogTitle>
            <DialogDescription>
              Save legal directive information for quick access.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveLegal} className="space-y-5">
            <Field label="Title" required>
              <input
                value={legalForm.title}
                onChange={(e) => setLegalForm((prev) => ({ ...prev, title: e.target.value }))}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                placeholder="Directive title"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status">
                <select
                  value={legalForm.status}
                  onChange={(e) => setLegalForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="Current">Current</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Archived">Archived</option>
                </select>
              </Field>

              <Field label="Last Updated">
                <input
                  value={legalForm.lastUpdated}
                  onChange={(e) => setLegalForm((prev) => ({ ...prev, lastUpdated: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  placeholder="Jan 2026"
                />
              </Field>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLegalDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingLegal ? 'Save changes' : 'Add directive'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={checklistDialogOpen}
        onOpenChange={(open) => {
          setChecklistDialogOpen(open);
          if (!open) resetChecklistForm();
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add checklist item</DialogTitle>
            <DialogDescription>
              Add a new emergency preparedness task.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveChecklistItem} className="space-y-5">
            <Field label="Checklist item" required>
              <input
                value={checklistForm.item}
                onChange={(e) => setChecklistForm({ item: e.target.value })}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                placeholder="Checklist item"
              />
            </Field>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setChecklistDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Add item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently remove this item from emergency info.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border bg-muted/40 p-3 text-sm">
            {deleteTarget?.label || 'Selected item'}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirmed} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, required = false, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <Card className="rounded-2xl border-dashed shadow-sm">
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-4 max-w-md text-sm text-muted-foreground">{description}</p>
        {actionLabel && onAction ? (
          <Button className="rounded-xl" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function LoadingCard({ text }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6 text-sm text-muted-foreground">
        {text}
      </CardContent>
    </Card>
  );
}

export default EmergencyPage;
