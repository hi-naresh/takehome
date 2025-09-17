"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { strings } from "@/shared/language/en";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useContracts } from "@/hooks/use-contracts";
import { ContractForm } from "@/components/contract-form";
import type { Contract, ExtractionData } from "@/types/contracts";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  ArrowRight,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const [file, setFile] = React.useState<File | null>(null);
  const [taskOpen, setTaskOpen] = React.useState(false);
  const [selectedContract, setSelectedContract] =
    React.useState<Contract | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadComplete, setUploadComplete] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [extractedData, setExtractedData] =
    React.useState<ExtractionData | null>(null);
  const [showReview, setShowReview] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedData, setEditedData] = React.useState<ExtractionData | null>(
    null,
  );
  // Validation removed for now

  const {
    contracts,
    loading,
    error,
    extractContractData,
    saveContract,
    updateContract,
    scheduleReminder,
  } = useContracts();

  // Do not auto-open the contract details modal after save.
  // The modal should only open when the user explicitly selects a contract from the list.

  // Show error toasts
  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      toast.warning(strings.upload.missingFile);
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    setUploadComplete(false);
    setShowReview(false);
    setExtractedData(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    try {
      toast.info("Extracting contract data...");
      const extractionResponse = await extractContractData(file);
      setUploadProgress(100);
      // Always show extracted data for review (validation disabled)
      setExtractedData(extractionResponse.extractedData);
      setShowReview(true);
      toast.success("Contract data extracted! Please review and save.");

      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      clearInterval(progressInterval);
      toast.error(error instanceof Error ? error.message : "Extraction failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveContract() {
    if (!extractedData) return;

    try {
      setSubmitting(true);
      await saveContract(extractedData);
      setUploadComplete(true);
      setShowReview(false);
      setIsEditing(false);
      setEditedData(null);
      toast.success("Contract saved successfully!");
      setTimeout(() => {
        setFile(null);
        setUploadComplete(false);
        setExtractedData(null);
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDiscardContract() {
    setShowReview(false);
    setExtractedData(null);
    // validation disabled
    setIsEditing(false);
    setEditedData(null);
    toast.info("Contract discarded");
  }

  function handleEditContract() {
    setIsEditing(true);
    setEditedData(extractedData ? { ...extractedData } : null);
  }

  function handleCancelEdit() {
    setIsEditing(false);
    setEditedData(null);
  }

  function handleSaveEdit() {
    if (!editedData) return;

    setExtractedData(editedData);
    setIsEditing(false);
    setEditedData(null);
    toast.success("Contract data updated");
  }

  function handleFieldChange(field: keyof ExtractionData, value: string) {
    if (!editedData) return;
    setEditedData({ ...editedData, [field]: value });
  }

  // Validation removed

  // Handle file selection
  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else if (selectedFile) {
      toast.error("Please select a PDF file");
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  // Determine current step for progress indicator
  const getCurrentStep = () => {
    if (uploadComplete) return 4;
    if (showReview) return 3;
    if (submitting) return 2;
    return 1;
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {strings.app.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {strings.results.description}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { step: 1, label: "Upload PDF", icon: Upload },
              { step: 2, label: "AI Extraction", icon: FileText },
              { step: 3, label: "Review & Edit", icon: CheckCircle },
              { step: 4, label: "Save Data", icon: Clock },
            ].map(({ step, label, icon: Icon }, index) => (
              <React.Fragment key={step}>
                <div
                  className={`flex flex-col items-center ${getCurrentStep() >= step ? "text-primary" : "text-muted-foreground"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      getCurrentStep() >= step
                        ? "border-primary bg-primary text-primary-foreground"
                        : getCurrentStep() === step - 1 && submitting
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                    }`}
                  >
                    {getCurrentStep() === step - 1 &&
                    submitting &&
                    step === 2 ? (
                      <Spinner size="sm" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-sm mt-2 font-medium">{label}</span>
                </div>
                {index < 3 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                {strings.upload.cardTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!uploadComplete ? (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragOver
                        ? "border-primary bg-primary/10"
                        : file
                          ? "border-primary bg-primary/10"
                          : "border-border"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <FileText
                      className={`w-12 h-12 mx-auto mb-4 ${
                        file ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-4">
                        {dragOver
                          ? strings.upload.dropHere
                          : file
                            ? strings.upload.fileSelected
                            : strings.upload.dragOrBrowse}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => document.getElementById("file")?.click()}
                      >
                        {strings.upload.chooseFile}
                      </Button>
                      {file && (
                        <div className="text-sm text-primary font-medium">
                          ✓ {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </div>
                      )}
                    </div>
                    <Input
                      id="file"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        handleFileSelect(e.target.files?.[0] ?? null)
                      }
                      className="hidden"
                    />
                  </div>

                  {submitting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{strings.common.processing}</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!file || submitting}
                    className={`w-full ${file && !submitting ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : file ? (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {strings.upload.submit}
                      </>
                    ) : (
                      strings.upload.ctaNoFile
                    )}
                  </Button>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>{strings.upload.hintFormats}</div>
                    <div>{strings.upload.hintMaxSize}</div>
                    <div>{strings.upload.hintTextOnly}</div>
                  </div>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">
                      {strings.upload.successTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {file?.name} •{" "}
                      {file?.size ? (file.size / 1024).toFixed(1) : "0"} KB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setUploadComplete(false);
                      setUploadProgress(0);
                    }}
                  >
                    {strings.upload.uploadAnother}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extracted Data Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {strings.results.heading}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showReview && extractedData ? (
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">
                          {strings.results.validDataExtracted}
                        </span>
                      </div>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditContract}
                          className="border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          {strings.common.edit}
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-primary">
                      {isEditing
                        ? strings.results.editPrompt
                        : strings.results.reviewPrompt}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {[
                      {
                        label: "Contract Holder",
                        field: "contractHolderName" as keyof ExtractionData,
                        type: "text",
                        placeholder: "Enter contract holder name",
                      },
                      {
                        label: "Contract ID",
                        field: "contractId" as keyof ExtractionData,
                        type: "text",
                        placeholder: "Enter contract ID",
                      },
                      {
                        label: "Renewal Date",
                        field: "renewalDate" as keyof ExtractionData,
                        type: "date",
                        placeholder: "Select renewal date",
                      },
                      {
                        label: "Service/Product",
                        field: "serviceProduct" as keyof ExtractionData,
                        type: "text",
                        placeholder: "Enter service or product name",
                      },
                      {
                        label: "Contact Email",
                        field: "contactEmail" as keyof ExtractionData,
                        type: "email",
                        placeholder: "Enter contact email",
                      },
                    ].map(({ label, field, type, placeholder }) => {
                      const currentData = isEditing
                        ? editedData
                        : extractedData;
                      const value = currentData?.[field] || "";

                      return (
                        <div
                          key={label}
                          className="flex items-center gap-3 py-2 border-b border-border last:border-b-0"
                        >
                          <span className="font-medium text-foreground min-w-[140px]">
                            {label}:
                          </span>
                          {isEditing ? (
                            <Input
                              type={type}
                              value={value as string}
                              placeholder={placeholder}
                              onChange={(e) =>
                                handleFieldChange(field, e.target.value)
                              }
                              className="flex-1"
                            />
                          ) : (
                            <span className="text-muted-foreground flex-1">
                              {value || strings.common.notSpecified}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleCancelEdit}
                          disabled={submitting}
                        >
                          <X className="w-4 h-4 mr-1" />
                          {strings.contracts.cancelChanges}
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleSaveEdit}
                          disabled={submitting}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          {strings.contracts.saveChanges}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleDiscardContract}
                          disabled={submitting}
                        >
                          {strings.common.discard}
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleSaveContract}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              {strings.common.processing}
                            </>
                          ) : (
                            strings.common.saveContract
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                  </div>
              ) : selectedContract ? (
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {[
                      {
                        label: "Contract Holder",
                        value:
                          selectedContract.contractHolderName ||
                          "Not specified",
                      },
                      {
                        label: "Contract ID",
                        value:
                          selectedContract.contractIdentifier ||
                          "Not specified",
                      },
                      {
                        label: "Renewal Date",
                        value: selectedContract.renewalDate || "Not specified",
                      },
                      {
                        label: "Service/Product",
                        value:
                          selectedContract.serviceProduct || "Not specified",
                      },
                      {
                        label: "Contact Email",
                        value: selectedContract.contactEmail || "Not specified",
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex justify-between py-2 border-b border-border last:border-b-0"
                      >
                        <span className="font-medium text-foreground">
                          {label}:
                        </span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedContract(null)}
                  >
                    {strings.common.editContract}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{strings.results.empty}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contract Renewals */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Contract Renewals
              </span>
              <Button variant="outline" size="sm">
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>
              Contracts expiring in the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contracts.filter(
              (c) =>
                c.renewalDate &&
                new Date(c.renewalDate) <=
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            ).length > 0 ? (
              <div className="space-y-3">
                {contracts
                  .filter(
                    (c) =>
                      c.renewalDate &&
                      new Date(c.renewalDate) <=
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  )
                  .slice(0, 3)
                  .map((contract) => {
                    const daysUntil = contract.renewalDate
                      ? Math.ceil(
                          (new Date(contract.renewalDate).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24),
                        )
                      : 0;
                    return (
                      <div
                        key={contract.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {contract.contractHolderName || "Unknown"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {contract.serviceProduct}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              daysUntil <= 7
                                ? "destructive"
                                : daysUntil <= 14
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {daysUntil} days remaining
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{strings.contracts.noExpiringSoon}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contracts list hidden per requirement */}

        {/* Task Panel Button */}
        <div className="fixed top-4 right-4">
          <Button variant="outline" onClick={() => setTaskOpen((o) => !o)}>
            {taskOpen ? strings.taskPanel.close : strings.taskPanel.open}
          </Button>
        </div>

        {/* Selected Contract Details Modal */}
        {selectedContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>{strings.results.contractDetails}</CardTitle>
              </CardHeader>
              <CardContent>
                <ContractForm
                  contract={selectedContract}
                  onUpdate={updateContract}
                  onScheduleReminder={scheduleReminder}
                  loading={loading}
                />
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedContract(null)}
                  >
                    {strings.common.close}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Task description in a side sheet */}
        <Sheet open={taskOpen} onOpenChange={setTaskOpen}>
          <SheetContent side="right" className="w-[560px] max-w-[90vw]">
            <SheetHeader>
              <SheetTitle>{strings.task.heading}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 prose max-w-none dark:prose-invert text-sm">
              <pre className="whitespace-pre-wrap font-sans">
                {strings.task.descriptionMd}
              </pre>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </main>
  );
}
