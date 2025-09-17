"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Contract } from "@/types/contracts";
import { contractsService } from "@/services/contracts.service";

interface ContractsListProps {
  contracts: Contract[];
  onSelectContract: (contract: Contract) => void;
  loading?: boolean;
}

export function ContractsList({
  contracts,
  onSelectContract,
  loading,
}: ContractsListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Contracts</CardTitle>
          <CardDescription>Loading contracts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Contracts</CardTitle>
          <CardDescription>No contracts found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Upload your first contract to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Contracts</CardTitle>
        <CardDescription>
          {contracts.length} contract{contracts.length !== 1 ? "s" : ""} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contracts.map((contract) => {
            const isRenewalDue = contract.renewalDate
              ? contractsService.isRenewalDue(contract.renewalDate, 30)
              : false;

            const daysUntilRenewal = contract.renewalDate
              ? contractsService.calculateDaysUntilRenewal(contract.renewalDate)
              : null;

            return (
              <div
                key={contract.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">
                      {contract.contractHolderName || "Unnamed Contract"}
                    </h3>
                    {isRenewalDue && (
                      <Badge variant="destructive" className="text-xs">
                        Renewal Due
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      ID: {contract.contractIdentifier || "Not specified"}
                    </div>
                    <div>
                      Service: {contract.serviceProduct || "Not specified"}
                    </div>
                    {contract.renewalDate && (
                      <div>
                        Renewal:{" "}
                        {contractsService.formatDate(contract.renewalDate)}
                        {daysUntilRenewal !== null && (
                          <span className="ml-2">
                            ({daysUntilRenewal} days)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectContract(contract)}
                >
                  View
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
