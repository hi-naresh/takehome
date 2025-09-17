"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Contract } from "@/types/contracts";
import { ContractFormData, contractsService } from "@/services/contracts.service";

interface ContractFormProps {
  contract: Contract;
  onUpdate: (contractId: string, updates: ContractFormData) => Promise<void>;
  onScheduleReminder?: (
    contractId: string,
    renewalDate: string,
    daysBeforeRenewal: number,
  ) => Promise<void>;
  loading?: boolean;
}

export function ContractForm({
  contract,
  onUpdate,
  onScheduleReminder,
  loading,
}: ContractFormProps) {
  const [formData, setFormData] = useState<ContractFormData>({
    contractHolderName: contract.contractHolderName || "",
    contractIdentifier: contract.contractIdentifier || "",
    renewalDate: contract.renewalDate || "",
    serviceProduct: contract.serviceProduct || "",
    contactEmail: contract.contactEmail || "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdate(contract.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      contractHolderName: contract.contractHolderName || "",
      contractIdentifier: contract.contractIdentifier || "",
      renewalDate: contract.renewalDate || "",
      serviceProduct: contract.serviceProduct || "",
      contactEmail: contract.contactEmail || "",
    });
    setIsEditing(false);
  };

  const handleScheduleReminder = async () => {
    if (!contract.renewalDate || !onScheduleReminder) return;

    try {
      await onScheduleReminder(contract.id, contract.renewalDate, 30);
    } catch (error) {
      console.error("Reminder scheduling failed:", error);
    }
  };

  const daysUntilRenewal = contract.renewalDate
    ? contractsService.calculateDaysUntilRenewal(contract.renewalDate)
    : null;

  const isRenewalDue = contract.renewalDate
    ? contractsService.isRenewalDue(contract.renewalDate, 30)
    : false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contract Details</CardTitle>
            <CardDescription>Contract ID: {contract.id}</CardDescription>
          </div>
          <div className="flex gap-2">
            {contract.renewalDate && (
              <Badge variant={isRenewalDue ? "destructive" : "secondary"}>
                {daysUntilRenewal !== null
                  ? `${daysUntilRenewal} days until renewal`
                  : "Renewal date not set"}
              </Badge>
            )}
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving || loading}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="grid grid-cols-3 items-center gap-3">
            <Label htmlFor="holderName" className="text-sm font-medium">
              Contract Holder
            </Label>
            <div className="col-span-2">
              <Input
                id="holderName"
                value={formData.contractHolderName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contractHolderName: e.target.value,
                  }))
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 items-center gap-3">
            <Label htmlFor="contractId" className="text-sm font-medium">
              Contract ID
            </Label>
            <div className="col-span-2">
              <Input
                id="contractId"
                value={formData.contractIdentifier}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contractIdentifier: e.target.value,
                  }))
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 items-center gap-3">
            <Label htmlFor="renewalDate" className="text-sm font-medium">
              Renewal Date
            </Label>
            <div className="col-span-2">
              <Input
                id="renewalDate"
                type="date"
                value={formData.renewalDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    renewalDate: e.target.value,
                  }))
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 items-center gap-3">
            <Label htmlFor="serviceProduct" className="text-sm font-medium">
              Service/Product
            </Label>
            <div className="col-span-2">
              <Input
                id="serviceProduct"
                value={formData.serviceProduct}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    serviceProduct: e.target.value,
                  }))
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 items-center gap-3">
            <Label htmlFor="contactEmail" className="text-sm font-medium">
              Contact Email
            </Label>
            <div className="col-span-2">
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactEmail: e.target.value,
                  }))
                }
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {contract.renewalDate && onScheduleReminder && (
          <div className="pt-4 border-t">
            <Button
              variant="secondary"
              onClick={handleScheduleReminder}
              disabled={loading}
            >
              Schedule 30-day Renewal Reminder
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Created: {contractsService.formatDate(contract.createdAt)} • Updated:{" "}
          {contractsService.formatDate(contract.updatedAt)}
        </div>
      </CardContent>
    </Card>
  );
}
