"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, FileText, Video, Type, Package, FileSpreadsheet, Download, Loader2 } from "lucide-react";
import Papa from "papaparse";

export default function UploadProposalsPage() {
  const [teamName, setTeamName] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [proposalUrl, setProposalUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName || !productName) {
      toast.error("Team Name and Product Name are required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("proposals").insert({
      team_name: teamName,
      product_name: productName,
      description,
      proposal_url: proposalUrl,
      video_url: videoUrl,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Proposal uploaded successfully!");
    setTeamName("");
    setProductName("");
    setDescription("");
    setProposalUrl("");
    setVideoUrl("");
    router.refresh();
    setLoading(false);
  };

  const downloadTemplate = () => {
    const templateContent = "team_name,product_name,description,proposal_url,video_url\nExample Team,SmartLearn AI,An AI-powered learning system,https://drive.google.com/file/...,https://youtube.com/watch?...";
    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "ideasprint_proposals_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        
        // Basic validation
        if (rows.length === 0) {
          toast.error("The CSV file is empty");
          setBulkLoading(false);
          return;
        }

        if (!("team_name" in rows[0]) || !("product_name" in rows[0])) {
          toast.error("Invalid CSV format. Missing required columns 'team_name' and 'product_name'");
          setBulkLoading(false);
          return;
        }

        // Format for DB
        const proposalsToInsert = rows.map((row) => ({
          team_name: row.team_name,
          product_name: row.product_name,
          description: row.description || null,
          proposal_url: row.proposal_url || null,
          video_url: row.video_url || null,
        })).filter(p => p.team_name && p.product_name); // Skip completely empty required rows

        const { error } = await supabase.from("proposals").insert(proposalsToInsert);

        if (error) {
          toast.error(error.message);
        } else {
          toast.success(`Successfully uploaded ${proposalsToInsert.length} proposals!`);
          if (fileInputRef.current) fileInputRef.current.value = "";
          router.refresh();
        }
        
        setBulkLoading(false);
      },
      error: (error) => {
        toast.error(`CSV Parsing error: ${error.message}`);
        setBulkLoading(false);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Proposals</h2>
        <p className="text-muted-foreground mt-2">
          Add team proposals for the evaluation portal via single entry or bulk CSV.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Single Upload Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Single Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSingleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="proposal-team-name">Team Name</Label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="proposal-team-name"
                    placeholder="Team Innovators"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="proposal-product-name">Product Name</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="proposal-product-name"
                    placeholder="SmartLearn AI"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="proposal-description">Description</Label>
                <Textarea
                  id="proposal-description"
                  placeholder="A brief description of the team's proposal..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="proposal-pdf-url">Proposal PDF Link</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="proposal-pdf-url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={proposalUrl}
                    onChange={(e) => setProposalUrl(e.target.value)}
                    type="url"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="proposal-video-url">Pitch Video Link</Label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="proposal-video-url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    type="url"
                    className="pl-9"
                  />
                </div>
              </div>
              <Button
                id="proposal-submit"
                type="submit"
                disabled={loading}
                className="mt-2 w-full"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Uploading..." : "Upload Proposal"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bulk Upload Section */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
            <CardTitle>Bulk CSV Upload</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="font-semibold text-foreground mb-2">Instructions</h3>
              <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1 mb-4">
                <li>Download the template below.</li>
                <li>Fill in the rows without modifying the header row.</li>
                <li><span className="font-medium text-foreground">team_name</span> and <span className="font-medium text-foreground">product_name</span> are required.</li>
                <li>Save as a .csv file and upload.</li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={downloadTemplate}
              >
                <Download className="mr-2 h-4 w-4" /> Download Demo Template
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Select CSV File</Label>
              <Input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleBulkUpload}
                disabled={bulkLoading}
                className="cursor-pointer"
              />
              {bulkLoading && <p className="text-sm text-muted-foreground animate-pulse mt-2 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing and uploading data...</p>}
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
